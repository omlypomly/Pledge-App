"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateInviteCode, generateInviteLink } from "@/lib/utils";
import type { CreateChallengeInput } from "@/types";
import { addMonths } from "date-fns";

export async function createChallenge(input: CreateChallengeInput) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error("User not found");

  const inviteCode = generateInviteCode();
  const inviteLink = generateInviteLink(inviteCode);

  const challenge = await prisma.challenge.create({
    data: {
      name: input.name,
      description: input.description,
      goalType: input.goalType as never,
      verificationMethod: input.verificationMethod as never,
      durationMonths: input.durationMonths,
      stakeAmount: input.stakeAmount,
      maxParticipants: input.maxParticipants,
      isPrivate: input.isPrivate ?? false,
      customRules: input.customRules,
      coverImageUrl: input.coverImageUrl,
      inviteCode,
      inviteLink,
      creatorId: user.id,
      milestones: {
        create: input.milestones.map((m, i) => ({
          title: m.title,
          description: m.description,
          deadline: m.deadline,
          targetValue: m.targetValue,
          targetUnit: m.targetUnit,
          orderIndex: i + 1,
        })),
      },
    },
    include: { milestones: true },
  });

  await prisma.participant.create({
    data: {
      userId: user.id,
      challengeId: challenge.id,
      stakeAmount: input.stakeAmount,
      status: "INVITED",
    },
  });

  revalidatePath("/dashboard");
  return { success: true, challenge };
}

export async function joinChallenge(inviteCode: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error("User not found");

  const challenge = await prisma.challenge.findUnique({
    where: { inviteCode },
    include: { participants: true },
  });

  if (!challenge) throw new Error("Challenge not found");
  if (challenge.status === "ACTIVE") throw new Error("Challenge already started");
  if (challenge.status === "COMPLETED") throw new Error("Challenge is over");
  if (challenge.participants.length >= challenge.maxParticipants) {
    throw new Error("Challenge is full");
  }

  const existing = challenge.participants.find((p) => p.userId === user.id);
  if (existing) throw new Error("Already joined this challenge");

  const participant = await prisma.participant.create({
    data: {
      userId: user.id,
      challengeId: challenge.id,
      stakeAmount: challenge.stakeAmount,
      status: "INVITED",
    },
  });

  await prisma.chatMessage.create({
    data: {
      challengeId: challenge.id,
      userId: user.id,
      content: `${user.displayName || "A new member"} joined the challenge! 🎉`,
      isSystem: true,
    },
  });

  revalidatePath(`/challenges/${challenge.id}`);
  return { success: true, participant, challenge };
}

export async function getChallengeById(id: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { clerkId } });

  return prisma.challenge.findUnique({
    where: { id },
    include: {
      creator: {
        select: { id: true, displayName: true, avatarUrl: true, username: true },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              username: true,
              xp: true,
              level: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      milestones: {
        orderBy: { orderIndex: "asc" },
        include: {
          submissions: {
            where: user
              ? {
                  participant: { userId: user.id },
                }
              : undefined,
            orderBy: { submittedAt: "desc" },
            take: 1,
          },
        },
      },
      _count: { select: { participants: true, chatMessages: true } },
    },
  });
}

export async function getUserChallenges() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return [];

  return prisma.challenge.findMany({
    where: {
      participants: { some: { userId: user.id } },
    },
    include: {
      creator: {
        select: { displayName: true, avatarUrl: true },
      },
      participants: {
        select: { userId: true, status: true },
      },
      milestones: {
        select: { id: true, title: true, status: true, deadline: true },
        orderBy: { orderIndex: "asc" },
      },
      _count: { select: { participants: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function startChallenge(challengeId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error("User not found");

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      participants: { where: { depositedAt: { not: null } } },
    },
  });

  if (!challenge) throw new Error("Challenge not found");
  if (challenge.creatorId !== user.id) throw new Error("Not the creator");
  if (challenge.status !== "PENDING") throw new Error("Challenge not in pending state");

  const now = new Date();
  const endsAt = addMonths(now, challenge.durationMonths);

  await prisma.challenge.update({
    where: { id: challengeId },
    data: {
      status: "ACTIVE",
      startsAt: now,
      endsAt,
      prizePool: challenge.participants.length * challenge.stakeAmount,
      totalParticipants: challenge.participants.length,
    },
  });

  await prisma.participant.updateMany({
    where: { challengeId, depositedAt: { not: null } },
    data: { status: "ACTIVE" },
  });

  await prisma.chatMessage.create({
    data: {
      challengeId,
      userId: user.id,
      content: "🚀 Challenge has officially started! Good luck everyone!",
      isSystem: true,
    },
  });

  revalidatePath(`/challenges/${challengeId}`);
  return { success: true };
}

export async function eliminateParticipant(participantId: string, milestoneId: string) {
  const participant = await prisma.participant.update({
    where: { id: participantId },
    data: {
      status: "ELIMINATED",
      eliminatedAt: new Date(),
      eliminationMilestoneId: milestoneId,
    },
    include: {
      user: { select: { displayName: true } },
      challenge: { select: { id: true, name: true } },
    },
  });

  await prisma.chatMessage.create({
    data: {
      challengeId: participant.challengeId,
      userId: participant.userId,
      content: `🔴 ${participant.user.displayName || "A participant"} was eliminated from the challenge.`,
      isSystem: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: participant.userId,
      challengeId: participant.challengeId,
      type: "ELIMINATED",
      title: "You've been eliminated",
      body: `You missed a milestone in ${participant.challenge.name} and have been eliminated.`,
    },
  });

  revalidatePath(`/challenges/${participant.challengeId}`);
  return { success: true };
}

export async function completeChallenge(challengeId: string) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      participants: { where: { status: "ACTIVE" } },
    },
  });

  if (!challenge) throw new Error("Challenge not found");

  const winners = challenge.participants;
  const prizePerWinner =
    winners.length > 0
      ? (challenge.prizePool * (1 - challenge.platformFeePercent / 100)) /
        winners.length
      : 0;

  await prisma.$transaction([
    prisma.challenge.update({
      where: { id: challengeId },
      data: {
        status: "COMPLETED",
        winnersCount: winners.length,
      },
    }),
    ...winners.map((p) =>
      prisma.participant.update({
        where: { id: p.id },
        data: { status: "WINNER", payoutAmount: prizePerWinner },
      })
    ),
    ...winners.map((p) =>
      prisma.payout.create({
        data: {
          challengeId,
          participantId: p.id,
          amount: challenge.prizePool / winners.length,
          platformFee:
            (challenge.prizePool / winners.length) *
            (challenge.platformFeePercent / 100),
          netAmount: prizePerWinner,
          status: "PENDING",
        },
      })
    ),
    ...winners.map((p) =>
      prisma.user.update({
        where: { id: p.userId },
        data: {
          challengesWon: { increment: 1 },
          totalEarned: { increment: prizePerWinner },
          xp: { increment: 500 },
        },
      })
    ),
  ]);

  revalidatePath(`/challenges/${challengeId}`);
  return { success: true, winners: winners.length, prizePerWinner };
}

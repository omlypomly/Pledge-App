"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyMilestoneProof } from "@/lib/ai/verification";
import { addHours } from "date-fns";

export async function submitMilestoneProof(data: {
  challengeId: string;
  milestoneId: string;
  proofUrls: string[];
  proofType: string;
  notes?: string;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error("User not found");

  const participant = await prisma.participant.findUnique({
    where: {
      userId_challengeId: { userId: user.id, challengeId: data.challengeId },
    },
  });

  if (!participant) throw new Error("Not a participant");
  if (participant.status === "ELIMINATED") throw new Error("You have been eliminated");

  const milestone = await prisma.milestone.findUnique({
    where: { id: data.milestoneId },
    include: { challenge: true },
  });

  if (!milestone) throw new Error("Milestone not found");

  const existing = await prisma.submission.findFirst({
    where: {
      participantId: participant.id,
      milestoneId: data.milestoneId,
      status: { in: ["APPROVED", "PENDING", "AI_REVIEWING", "COMMUNITY_VOTING"] },
    },
  });

  if (existing) throw new Error("Already submitted for this milestone");

  const submission = await prisma.submission.create({
    data: {
      participantId: participant.id,
      milestoneId: data.milestoneId,
      challengeId: data.challengeId,
      proofUrls: data.proofUrls,
      proofType: data.proofType as never,
      notes: data.notes,
      status: "AI_REVIEWING",
    },
  });

  // Run AI verification
  try {
    const aiResult = await verifyMilestoneProof(
      data.proofUrls,
      milestone.description,
      milestone.challenge.goalType,
      milestone.targetValue ?? undefined,
      milestone.targetUnit ?? undefined
    );

    let newStatus: string;
    let votingDeadline: Date | undefined;

    if (aiResult.confidence >= 80) {
      newStatus = "APPROVED";
      await prisma.milestone.update({
        where: { id: data.milestoneId },
        data: { completedCount: { increment: 1 } },
      });
      await prisma.participant.update({
        where: { id: participant.id },
        data: {
          lastSubmissionAt: new Date(),
          xpEarned: { increment: 100 },
        },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { xp: { increment: 100 } },
      });
    } else {
      newStatus = "COMMUNITY_VOTING";
      votingDeadline = addHours(new Date(), 24);
    }

    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: newStatus as never,
        aiConfidence: aiResult.confidence,
        aiAnalysis: aiResult.analysis,
        aiFlags: aiResult.flags,
        riskScore: aiResult.riskScore,
        votingDeadline,
      },
    });

    revalidatePath(`/challenges/${data.challengeId}`);
    return {
      success: true,
      submissionId: submission.id,
      status: newStatus,
      aiConfidence: aiResult.confidence,
      requiresVoting: newStatus === "COMMUNITY_VOTING",
    };
  } catch {
    await prisma.submission.update({
      where: { id: submission.id },
      data: { status: "COMMUNITY_VOTING", votingDeadline: addHours(new Date(), 24) },
    });
    return {
      success: true,
      submissionId: submission.id,
      status: "COMMUNITY_VOTING",
      requiresVoting: true,
    };
  }
}

export async function voteOnSubmission(submissionId: string, voteType: "APPROVE" | "REJECT") {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error("User not found");

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { milestone: true },
  });

  if (!submission) throw new Error("Submission not found");
  if (submission.status !== "COMMUNITY_VOTING") throw new Error("Not in voting phase");

  const participant = await prisma.participant.findUnique({
    where: {
      userId_challengeId: {
        userId: user.id,
        challengeId: submission.challengeId,
      },
    },
  });

  if (!participant) throw new Error("Not a challenge participant");
  if (participant.id === submission.participantId) throw new Error("Cannot vote on own submission");

  const existing = await prisma.vote.findUnique({
    where: { submissionId_userId: { submissionId, userId: user.id } },
  });

  if (existing) throw new Error("Already voted");

  await prisma.$transaction([
    prisma.vote.create({
      data: {
        submissionId,
        participantId: participant.id,
        userId: user.id,
        voteType: voteType as never,
      },
    }),
    prisma.submission.update({
      where: { id: submissionId },
      data:
        voteType === "APPROVE"
          ? { communityApprove: { increment: 1 } }
          : { communityReject: { increment: 1 } },
    }),
  ]);

  const updated = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!updated) throw new Error("Submission not found");

  const totalVotes = updated.communityApprove + updated.communityReject;
  const approveRatio = updated.communityApprove / Math.max(totalVotes, 1);

  let finalStatus = updated.status;
  if (totalVotes >= 3) {
    if (approveRatio >= 0.6) {
      finalStatus = "APPROVED";
    } else if (approveRatio <= 0.4) {
      finalStatus = "REJECTED";
    } else if (totalVotes >= 5) {
      finalStatus = "DISPUTE";
    }
  }

  if (finalStatus !== updated.status) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: finalStatus as never, reviewedAt: new Date() },
    });

    if (finalStatus === "APPROVED") {
      await prisma.milestone.update({
        where: { id: submission.milestoneId },
        data: { completedCount: { increment: 1 } },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { xp: { increment: 100 } },
      });
    }
  }

  revalidatePath(`/challenges/${submission.challengeId}`);
  return { success: true, newStatus: finalStatus };
}

export async function getSubmissionsForVoting(challengeId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return [];

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return [];

  return prisma.submission.findMany({
    where: {
      challengeId,
      status: "COMMUNITY_VOTING",
      participant: { userId: { not: user.id } },
      votes: { none: { userId: user.id } },
    },
    include: {
      milestone: true,
      participant: {
        include: {
          user: { select: { displayName: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { votingDeadline: "asc" },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Missing invite code" }, { status: 400 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { inviteCode: code },
      include: {
        creator: {
          select: { displayName: true, avatarUrl: true, username: true },
        },
        milestones: {
          select: {
            id: true,
            title: true,
            description: true,
            deadline: true,
            orderIndex: true,
          },
          orderBy: { orderIndex: "asc" },
        },
        _count: { select: { participants: true } },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    let alreadyJoined = false;
    if (clerkId) {
      const user = await prisma.user.findUnique({ where: { clerkId } });
      if (user) {
        const participant = await prisma.participant.findUnique({
          where: {
            userId_challengeId: { userId: user.id, challengeId: challenge.id },
          },
        });
        alreadyJoined = participant !== null;
      }
    }

    const isFull = challenge._count.participants >= challenge.maxParticipants;

    return NextResponse.json({
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      stakeAmount: challenge.stakeAmount,
      prizePool: challenge.prizePool,
      maxParticipants: challenge.maxParticipants,
      participantCount: challenge._count.participants,
      status: challenge.status,
      durationMonths: challenge.durationMonths,
      verificationMethod: challenge.verificationMethod,
      goalType: challenge.goalType,
      isPrivate: challenge.isPrivate,
      startsAt: challenge.startsAt?.toISOString() ?? null,
      endsAt: challenge.endsAt?.toISOString() ?? null,
      creator: challenge.creator,
      milestones: challenge.milestones.map((m) => ({
        ...m,
        deadline: m.deadline.toISOString(),
      })),
      alreadyJoined,
      isFull,
    });
  } catch (error) {
    console.error("Challenge preview error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

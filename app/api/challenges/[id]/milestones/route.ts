import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: challengeId } = await params;
    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get("id");

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { name: true, id: true },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    let milestone;
    if (milestoneId) {
      milestone = await prisma.milestone.findFirst({
        where: { id: milestoneId, challengeId },
      });
    } else {
      // Return the active milestone or the first pending one
      milestone = await prisma.milestone.findFirst({
        where: { challengeId, status: { in: ["ACTIVE", "PENDING"] } },
        orderBy: { orderIndex: "asc" },
      });
    }

    if (!milestone) {
      return NextResponse.json(
        { error: "No active milestone found for this challenge" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      deadline: milestone.deadline.toISOString(),
      status: milestone.status,
      targetValue: milestone.targetValue,
      targetUnit: milestone.targetUnit,
      orderIndex: milestone.orderIndex,
      challengeName: challenge.name,
      challengeId: challenge.id,
    });
  } catch (error) {
    console.error("Milestone fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

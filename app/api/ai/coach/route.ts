import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateMotivationalMessage } from "@/lib/ai/verification";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeId } = await req.json();
  if (!challengeId) return NextResponse.json({ error: "Missing challengeId" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      milestones: true,
      participants: {
        where: { userId: user.id },
        include: { submissions: { where: { status: "APPROVED" } } },
      },
    },
  });

  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  const participant = challenge.participants[0];
  if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 });

  const completed = participant.submissions.length;
  const total = challenge.milestones.length;
  const nextMilestone = challenge.milestones.find((m) => m.status === "ACTIVE" || m.status === "PENDING");
  const daysLeft = nextMilestone
    ? Math.ceil((new Date(nextMilestone.deadline).getTime() - Date.now()) / 86400000)
    : 0;

  const message = await generateMotivationalMessage(
    user.displayName || "Champion",
    challenge.name,
    daysLeft,
    completed,
    total
  );

  return NextResponse.json({ message });
}

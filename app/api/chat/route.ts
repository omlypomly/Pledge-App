import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeId, content } = await req.json();

  if (!challengeId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const participant = await prisma.participant.findUnique({
    where: { userId_challengeId: { userId: user.id, challengeId } },
  });

  if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 });

  const message = await prisma.chatMessage.create({
    data: {
      challengeId,
      userId: user.id,
      content: content.slice(0, 1000),
    },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  });

  await pusher.trigger(`challenge-${challengeId}`, "new-message", {
    id: message.id,
    content: message.content,
    createdAt: message.createdAt,
    user: message.user,
  });

  return NextResponse.json({ success: true, message });
}

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const challengeId = searchParams.get("challengeId");
  const cursor = searchParams.get("cursor");

  if (!challengeId) return NextResponse.json({ error: "Missing challengeId" }, { status: 400 });

  const messages = await prisma.chatMessage.findMany({
    where: { challengeId },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  return NextResponse.json({ messages: messages.reverse() });
}

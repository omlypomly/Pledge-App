import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.formData();
  const socketId = data.get("socket_id") as string;
  const channelName = data.get("channel_name") as string;

  if (!socketId || !channelName) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const authResponse = pusher.authorizeChannel(socketId, channelName, {
    user_id: clerkId,
  });

  return NextResponse.json(authResponse);
}

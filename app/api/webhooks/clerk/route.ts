import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string;
    last_name: string;
    image_url: string;
  };
  type: string;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();

  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let event: ClerkUserEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { id, email_addresses, first_name, last_name, image_url } = event.data;
  const email = email_addresses[0]?.email_address || "";
  const displayName = `${first_name || ""} ${last_name || ""}`.trim() || email.split("@")[0];

  if (event.type === "user.created") {
    await prisma.user.upsert({
      where: { clerkId: id },
      update: { email, displayName, avatarUrl: image_url },
      create: { clerkId: id, email, displayName, avatarUrl: image_url },
    });
  }

  if (event.type === "user.updated") {
    await prisma.user.update({
      where: { clerkId: id },
      data: { email, displayName, avatarUrl: image_url },
    });
  }

  if (event.type === "user.deleted") {
    await prisma.user.update({
      where: { clerkId: id },
      data: { isBanned: true },
    });
  }

  return NextResponse.json({ received: true });
}

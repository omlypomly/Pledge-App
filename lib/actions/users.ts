"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function syncUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses[0]?.emailAddress || "";
  const displayName =
    `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
    email.split("@")[0];

  const user = await prisma.user.upsert({
    where: { clerkId },
    update: {
      email,
      displayName,
      avatarUrl: clerkUser.imageUrl,
      lastActiveAt: new Date(),
    },
    create: {
      clerkId,
      email,
      displayName,
      avatarUrl: clerkUser.imageUrl,
    },
  });

  return user;
}

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      badges: true,
      participants: {
        include: {
          challenge: {
            select: { id: true, name: true, status: true, endsAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          participants: true,
          badges: true,
        },
      },
    },
  });
}

export async function updateProfile(data: {
  displayName?: string;
  username?: string;
  bio?: string;
  timezone?: string;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error("User not found");

  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: { username: data.username, id: { not: user.id } },
    });
    if (existing) throw new Error("Username already taken");
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });

  revalidatePath(`/profile/${user.id}`);
  return { success: true, user: updated };
}

export async function acceptTerms() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { clerkId },
    data: { tosAccepted: true },
  });

  return { success: true };
}

export async function verifyAge() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { clerkId },
    data: { ageVerified: true },
  });

  return { success: true };
}

export async function getLeaderboard(limit = 50) {
  return prisma.user.findMany({
    where: { isBanned: false },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      username: true,
      xp: true,
      level: true,
      challengesWon: true,
      totalEarned: true,
      challengesEntered: true,
    },
    orderBy: { xp: "desc" },
    take: limit,
  });
}

export async function getNotifications() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return [];

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return [];

  return prisma.notification.findMany({
    where: { userId: user.id },
    include: {
      challenge: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationsRead() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return;

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return;

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/dashboard");
}

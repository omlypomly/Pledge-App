"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/client";
import { revalidatePath } from "next/cache";

export async function createDepositIntent(challengeId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error("User not found");

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });
  if (!challenge) throw new Error("Challenge not found");

  const participant = await prisma.participant.findUnique({
    where: { userId_challengeId: { userId: user.id, challengeId } },
  });
  if (!participant) throw new Error("Not a participant");
  if (participant.depositedAt) throw new Error("Already deposited");

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(challenge.stakeAmount * 100),
    currency: "usd",
    metadata: {
      challengeId,
      userId: user.id,
      participantId: participant.id,
      type: "stake_deposit",
    },
  });

  await prisma.participant.update({
    where: { id: participant.id },
    data: { stripePaymentIntentId: paymentIntent.id },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      challengeId,
      type: "DEPOSIT",
      status: "PENDING",
      amount: challenge.stakeAmount,
      stripePaymentIntentId: paymentIntent.id,
      description: `Stake deposit for "${challenge.name}"`,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
    amount: challenge.stakeAmount,
  };
}

export async function confirmDeposit(paymentIntentId: string) {
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (pi.status !== "succeeded") {
    throw new Error("Payment not completed");
  }

  const { challengeId, userId, participantId } = pi.metadata;

  await prisma.$transaction([
    prisma.participant.update({
      where: { id: participantId },
      data: { depositedAt: new Date() },
    }),
    prisma.transaction.updateMany({
      where: { stripePaymentIntentId: paymentIntentId },
      data: { status: "COMPLETED" },
    }),
    prisma.challenge.update({
      where: { id: challengeId },
      data: { prizePool: { increment: pi.amount / 100 } },
    }),
  ]);

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      participants: { where: { depositedAt: { not: null } } },
    },
  });

  if (!challenge) throw new Error("Challenge not found");

  const deposited = challenge.participants.length;
  if (deposited >= 2 && challenge.status === "DRAFT") {
    await prisma.challenge.update({
      where: { id: challengeId },
      data: { status: "PENDING" },
    });
  }

  revalidatePath(`/challenges/${challengeId}`);
  return { success: true };
}

export async function processPayouts(challengeId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user || user.role !== "ADMIN") throw new Error("Admin only");

  const payouts = await prisma.payout.findMany({
    where: { challengeId, status: "PENDING" },
    include: {
      participant: {
        include: { user: { select: { stripeAccountId: true, id: true } } },
      },
    },
  });

  const results = [];

  for (const payout of payouts) {
    const stripeAccountId = payout.participant.user.stripeAccountId;

    if (!stripeAccountId) {
      results.push({ payoutId: payout.id, error: "No Stripe account" });
      continue;
    }

    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(payout.netAmount * 100),
        currency: "usd",
        destination: stripeAccountId,
        metadata: {
          challengeId,
          payoutId: payout.id,
          userId: payout.participant.user.id,
        },
      });

      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: "COMPLETED",
          stripeTransferId: transfer.id,
          processedAt: new Date(),
        },
      });

      await prisma.user.update({
        where: { id: payout.participant.user.id },
        data: { totalEarned: { increment: payout.netAmount } },
      });

      results.push({ payoutId: payout.id, success: true, transferId: transfer.id });
    } catch (err) {
      results.push({ payoutId: payout.id, error: String(err) });
    }
  }

  revalidatePath(`/challenges/${challengeId}`);
  return { success: true, results };
}

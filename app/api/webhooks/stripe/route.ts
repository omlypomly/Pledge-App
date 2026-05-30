import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe, constructWebhookEvent } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = await constructWebhookEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const { challengeId, userId, participantId, type } = pi.metadata;

        if (type === "stake_deposit" && challengeId && participantId) {
          await prisma.$transaction([
            prisma.participant.update({
              where: { id: participantId },
              data: { depositedAt: new Date() },
            }),
            prisma.transaction.updateMany({
              where: { stripePaymentIntentId: pi.id },
              data: { status: "COMPLETED" },
            }),
            prisma.challenge.update({
              where: { id: challengeId },
              data: { prizePool: { increment: pi.amount / 100 } },
            }),
            prisma.user.update({
              where: { id: userId },
              data: {
                totalStaked: { increment: pi.amount / 100 },
                challengesEntered: { increment: 1 },
              },
            }),
          ]);

          const challenge = await prisma.challenge.findUnique({
            where: { id: challengeId },
            include: { participants: { where: { depositedAt: { not: null } } } },
          });

          if (challenge && challenge.participants.length >= 2 && challenge.status === "DRAFT") {
            await prisma.challenge.update({
              where: { id: challengeId },
              data: { status: "PENDING" },
            });
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await prisma.transaction.updateMany({
          where: { stripePaymentIntentId: pi.id },
          data: { status: "FAILED" },
        });
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        await prisma.payout.updateMany({
          where: { stripeTransferId: transfer.id },
          data: { status: "COMPLETED", processedAt: new Date() },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

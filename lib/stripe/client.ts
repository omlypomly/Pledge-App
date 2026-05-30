import Stripe from "stripe";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is required");
  _stripe = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export async function createPaymentIntent(
  amount: number,
  currency = "usd",
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  return getStripe().paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    capture_method: "automatic",
  });
}

export async function createConnectedAccount(email: string): Promise<string> {
  const account = await getStripe().accounts.create({
    type: "express",
    email,
    capabilities: {
      transfers: { requested: true },
    },
  });
  return account.id;
}

export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<string> {
  const link = await getStripe().accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
  return link.url;
}

export async function transferToConnected(
  amount: number,
  destinationAccountId: string,
  currency = "usd",
  metadata: Record<string, string> = {}
): Promise<Stripe.Transfer> {
  return getStripe().transfers.create({
    amount: Math.round(amount * 100),
    currency,
    destination: destinationAccountId,
    metadata,
  });
}

export async function retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
  return getStripe().paymentIntents.retrieve(id);
}

export async function constructWebhookEvent(
  payload: Buffer | string,
  signature: string,
  secret: string
): Promise<Stripe.Event> {
  return getStripe().webhooks.constructEvent(payload, signature, secret);
}

import Stripe from 'stripe';
import { env } from '../config/env';
import { Organization } from '../models/Organization.model';
import { PlanType } from '../models/Organization.model';

const stripeKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeKey ? new Stripe(stripeKey) : null;

const priceMap: Record<'pro' | 'enterprise', string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

export const createCheckoutSession = async (orgId: string, plan: 'pro' | 'enterprise') => {
  if (!stripe || !priceMap[plan]) {
    return { mock: true, url: `${env.CLIENT_URL}/billing?success=1&plan=${plan}` };
  }

  const org = await Organization.findById(orgId);
  if (!org) throw new Error('Org not found');

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceMap[plan]!, quantity: 1 }],
    success_url: `${env.CLIENT_URL}/billing?success=1`,
    cancel_url: `${env.CLIENT_URL}/billing?canceled=1`,
    metadata: { orgId, plan },
  });

  return { url: session.url, mock: false };
};

export const handleWebhook = async (payload: Buffer, signature: string) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return;
  const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { metadata?: { orgId?: string; plan?: PlanType } };
    const orgId = session.metadata?.orgId;
    const plan = session.metadata?.plan as PlanType;
    if (orgId && plan) await Organization.findByIdAndUpdate(orgId, { plan });
  }
};

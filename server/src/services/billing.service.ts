import { Organization, PlanType } from '../models/Organization.model';
import { ApiError } from '../utils/ApiError';
import * as notificationService from './notification.service';

export const PLANS: Record<
  PlanType,
  { name: string; price: number; leadsLimit: number; features: string[] }
> = {
  free: {
    name: 'Free',
    price: 0,
    leadsLimit: 50,
    features: ['50 leads', 'Basic dashboard', 'CSV export'],
  },
  pro: {
    name: 'Pro',
    price: 29,
    leadsLimit: 500,
    features: ['500 leads', 'Activity log', 'Priority support', 'Team members'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    leadsLimit: 10000,
    features: ['Unlimited leads', 'Custom roles', 'API access', 'Dedicated support'],
  },
};

export const getSubscription = async (orgId: string) => {
  const org = await Organization.findById(orgId);
  if (!org) throw new ApiError(404, 'Organization not found');
  return {
    plan: org.plan,
    ...PLANS[org.plan],
  };
};

export const checkout = async (
  orgId: string,
  plan: 'pro' | 'enterprise',
  userId: string
): Promise<{ success: boolean; plan: PlanType; message: string; url?: string | null; mock?: boolean }> => {
  const stripeCheckout = await import('./stripe.service').then((m) =>
    m.createCheckoutSession(orgId, plan)
  );

  if (stripeCheckout.mock) {
    const org = await Organization.findById(orgId);
    if (!org) throw new ApiError(404, 'Organization not found');
    org.plan = plan;
    await org.save();
    await notificationService.createNotification({
      userId,
      organizationId: orgId,
      title: 'Plan upgraded',
      message: `Upgraded to ${PLANS[plan].name}`,
      type: 'billing',
      link: '/billing',
    });
    return {
      success: true,
      plan,
      mock: true,
      url: stripeCheckout.url,
      message: `Upgraded to ${PLANS[plan].name} (mock).`,
    };
  }

  return {
    success: true,
    plan,
    mock: false,
    url: stripeCheckout.url,
    message: 'Redirect to Stripe checkout',
  };
};

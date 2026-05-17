import crypto from 'crypto';
import { Webhook } from '../models/Webhook.model';

export const dispatch = async (
  organizationId: string,
  event: string,
  payload: Record<string, unknown>
): Promise<void> => {
  const hooks = await Webhook.find({ organizationId, active: true, events: event });
  const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });

  await Promise.allSettled(
    hooks.map(async (hook) => {
      const signature = crypto.createHmac('sha256', hook.secret).update(body).digest('hex');
      await fetch(hook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Smart-Leads-Signature': signature,
        },
        body,
      });
    })
  );
};

export const list = (orgId: string) => Webhook.find({ organizationId: orgId }).lean();

export const create = async (orgId: string, url: string, events: string[]) => {
  const secret = crypto.randomBytes(16).toString('hex');
  return Webhook.create({ organizationId: orgId, url, events, secret });
};

export const remove = async (orgId: string, id: string) => {
  await Webhook.findOneAndDelete({ _id: id, organizationId: orgId });
};

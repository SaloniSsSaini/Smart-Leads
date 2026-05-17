import { Request, Response } from 'express';
import * as webhookService from '../services/webhook.service';
import { asyncHandler } from '../utils/asyncHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const data = await webhookService.list(req.user!.orgId);
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const hook = await webhookService.create(req.user!.orgId, req.body.url, req.body.events);
  res.status(201).json({ success: true, data: hook });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await webhookService.remove(req.user!.orgId, String(req.params.id));
  res.json({ success: true, message: 'Webhook removed' });
});

import { Request, Response } from 'express';
import * as billingService from '../services/billing.service';
import { asyncHandler } from '../utils/asyncHandler';

export const getPlans = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: billingService.PLANS });
});

export const getSubscription = asyncHandler(async (req: Request, res: Response) => {
  const data = await billingService.getSubscription(req.user!.orgId);
  res.json({ success: true, data });
});

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const result = await billingService.checkout(
    req.user!.orgId,
    req.body.plan,
    req.user!.userId
  );
  res.json({ success: true, data: result });
});

import { Request, Response } from 'express';
import * as inviteService from '../services/invite.service';
import { asyncHandler } from '../utils/asyncHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const data = await inviteService.listInvites(req.user!.orgId);
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const invite = await inviteService.createInvite(
    req.user!.orgId,
    req.body.email,
    req.body.role ?? 'sales',
    req.user!.userId
  );
  res.status(201).json({ success: true, data: invite });
});

export const accept = asyncHandler(async (req: Request, res: Response) => {
  const data = await inviteService.acceptInvite(req.body.token, req.user!.userId);
  res.json({ success: true, data });
});

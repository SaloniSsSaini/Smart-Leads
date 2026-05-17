import { Request, Response } from 'express';
import * as leadService from '../services/lead.service';
import { asyncHandler } from '../utils/asyncHandler';

export const globalSearch = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query.q || '');
  const data = await leadService.globalSearch(
    req.user!.orgId,
    q,
    req.user!.userId,
    req.user!.role
  );
  res.json({ success: true, data });
});

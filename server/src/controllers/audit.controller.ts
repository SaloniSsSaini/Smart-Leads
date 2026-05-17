import { Request, Response } from 'express';
import * as auditService from '../services/audit.service';
import { asyncHandler } from '../utils/asyncHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const data = await auditService.list(req.user!.orgId);
  res.json({ success: true, data });
});

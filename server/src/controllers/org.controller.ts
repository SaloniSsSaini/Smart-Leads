import { Request, Response } from 'express';
import * as orgService from '../services/org.service';
import { asyncHandler } from '../utils/asyncHandler';

export const listOrgs = asyncHandler(async (req: Request, res: Response) => {
  const orgs = await orgService.getUserOrganizations(req.user!.userId);
  res.json({ success: true, data: orgs });
});

export const createOrg = asyncHandler(async (req: Request, res: Response) => {
  const org = await orgService.createOrganization(req.user!.userId, req.body.name);
  res.status(201).json({ success: true, data: org });
});

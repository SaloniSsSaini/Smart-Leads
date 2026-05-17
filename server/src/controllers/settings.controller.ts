import { Request, Response } from 'express';
import { Organization } from '../models/Organization.model';
import { OrganizationMember } from '../models/OrganizationMember.model';
import { User } from '../models/User.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const getOrgSettings = asyncHandler(async (req: Request, res: Response) => {
  const org = await Organization.findById(req.user!.orgId);
  if (!org) throw new ApiError(404, 'Organization not found');
  res.json({ success: true, data: { branding: org.branding, plan: org.plan, name: org.name } });
});

export const updateBranding = asyncHandler(async (req: Request, res: Response) => {
  const org = await Organization.findByIdAndUpdate(
    req.user!.orgId,
    { branding: req.body },
    { new: true }
  );
  res.json({ success: true, data: org?.branding });
});

export const getTeam = asyncHandler(async (req: Request, res: Response) => {
  const members = await OrganizationMember.find({ organizationId: req.user!.orgId })
    .populate('userId', 'name email')
    .lean();
  res.json({ success: true, data: members });
});

export const updateMemberPermissions = asyncHandler(async (req: Request, res: Response) => {
  await OrganizationMember.findOneAndUpdate(
    { _id: req.params.memberId, organizationId: req.user!.orgId },
    { permissions: req.body.permissions }
  );
  res.json({ success: true, message: 'Permissions updated' });
});

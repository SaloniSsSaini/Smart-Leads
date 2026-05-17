import crypto from 'crypto';
import { Invite } from '../models/Invite.model';
import { OrganizationMember } from '../models/OrganizationMember.model';
import { User } from '../models/User.model';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../types/express';
import * as emailService from './email.service';
import * as auditService from './audit.service';

export const createInvite = async (
  orgId: string,
  email: string,
  role: UserRole,
  invitedBy: string
) => {
  const token = crypto.randomBytes(24).toString('hex');
  const invite = await Invite.create({
    email: email.toLowerCase(),
    organizationId: orgId,
    role,
    token,
    invitedBy,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const url = `${env.CLIENT_URL}/register?invite=${token}`;
  await emailService.sendEmail(
    email,
    'You are invited to Smart Leads',
    `<p>Join your team: <a href="${url}">${url}</a></p>`
  );

  await auditService.log(orgId, invitedBy, 'invite', 'team', `Invited ${email} as ${role}`);
  return invite;
};

export const acceptInvite = async (token: string, userId: string) => {
  const invite = await Invite.findOne({ token, acceptedAt: { $exists: false } });
  if (!invite || invite.expiresAt < new Date()) throw new ApiError(400, 'Invalid or expired invite');

  const existing = await OrganizationMember.findOne({
    userId,
    organizationId: invite.organizationId,
  });
  if (!existing) {
    await OrganizationMember.create({
      userId,
      organizationId: invite.organizationId,
      role: invite.role,
      permissions: invite.role === 'admin' ? ['*'] : [],
    });
  }

  invite.acceptedAt = new Date();
  await invite.save();
  await User.findByIdAndUpdate(userId, { currentOrganizationId: invite.organizationId });

  return { orgId: invite.organizationId.toString(), role: invite.role };
};

export const listInvites = (orgId: string) =>
  Invite.find({ organizationId: orgId }).sort({ createdAt: -1 }).lean();

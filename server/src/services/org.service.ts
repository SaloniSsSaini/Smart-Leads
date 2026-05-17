import { Organization, IOrganization } from '../models/Organization.model';
import { OrganizationMember } from '../models/OrganizationMember.model';
import { User } from '../models/User.model';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../types/express';

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) + '-' + Date.now().toString(36);

export const createOrganizationForUser = async (
  userId: string,
  orgName: string,
  role: UserRole = 'admin'
) => {
  const org = await Organization.create({
    name: orgName,
    slug: slugify(orgName),
    ownerId: userId,
    plan: 'free',
  });

  await OrganizationMember.create({
    userId,
    organizationId: org._id,
    role,
    permissions: role === 'admin' ? ['*'] : [],
  });

  await User.findByIdAndUpdate(userId, { currentOrganizationId: org._id });

  return org;
};

export const getUserOrganizations = async (userId: string) => {
  const memberships = await OrganizationMember.find({ userId })
    .populate<{ organizationId: IOrganization }>('organizationId')
    .lean();

  return memberships
    .filter((m) => m.organizationId && typeof m.organizationId === 'object')
    .map((m) => ({
      id: String(m.organizationId._id),
      name: m.organizationId.name,
      plan: m.organizationId.plan,
      role: m.role,
    }));
};

export const getMemberRole = async (userId: string, orgId: string): Promise<UserRole> => {
  const member = await OrganizationMember.findOne({ userId, organizationId: orgId });
  if (!member) throw new ApiError(403, 'Not a member of this organization');
  return member.role;
};

export const switchOrganization = async (userId: string, orgId: string) => {
  const member = await OrganizationMember.findOne({ userId, organizationId: orgId });
  if (!member) throw new ApiError(403, 'Not a member of this organization');

  await User.findByIdAndUpdate(userId, { currentOrganizationId: orgId });
  return { orgId, role: member.role };
};

export const createOrganization = async (userId: string, name: string) => {
  return createOrganizationForUser(userId, name, 'admin');
};

import { Request, Response, NextFunction } from 'express';
import { OrganizationMember } from '../models/OrganizationMember.model';
import { ApiError } from '../utils/ApiError';

export const requirePermission =
  (permission: string) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required'));
      return;
    }
    if (req.user.role === 'admin') {
      next();
      return;
    }
    const member = await OrganizationMember.findOne({
      userId: req.user.userId,
      organizationId: req.user.orgId,
    });
    const perms = member?.permissions ?? [];
    if (perms.includes('*') || perms.includes(permission)) {
      next();
      return;
    }
    // Default sales permissions
    const defaults = ['leads:read', 'leads:create', 'leads:update', 'leads:export'];
    if (defaults.includes(permission)) {
      next();
      return;
    }
    next(new ApiError(403, 'Permission denied'));
  };

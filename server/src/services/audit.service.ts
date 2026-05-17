import { AuditLog } from '../models/AuditLog.model';

export const log = async (
  organizationId: string,
  userId: string,
  action: string,
  entity: string,
  details: string,
  entityId?: string
): Promise<void> => {
  await AuditLog.create({ organizationId, userId, action, entity, entityId, details });
};

export const list = async (organizationId: string, limit = 50) => {
  return AuditLog.find({ organizationId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

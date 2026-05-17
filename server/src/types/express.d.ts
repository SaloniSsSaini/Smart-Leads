import { Types } from 'mongoose';

export type UserRole = 'admin' | 'sales';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
        orgId: string;
      };
    }
  }
}

export interface AuthPayload {
  userId: string;
  role: UserRole;
  orgId: string;
}

export type ObjectId = Types.ObjectId;

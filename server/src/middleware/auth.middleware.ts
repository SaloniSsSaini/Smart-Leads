import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { AuthPayload } from '../types/express';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new ApiError(401, 'Authentication required'));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = { userId: decoded.userId, role: decoded.role, orgId: decoded.orgId };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

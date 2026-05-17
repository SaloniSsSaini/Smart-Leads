import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, orgName } = req.body;
  const result = await authService.register(name, email, password, orgName);
  res.status(201).json({ success: true, message: result.message, data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, totpToken } = req.body;
  const result = await authService.login(email, password, totpToken);
  res.json({ success: true, message: 'Login successful', data: result });
});

export const setup2FA = asyncHandler(async (req: Request, res: Response) => {
  const data = await import('../services/twoFactor.service').then((m) => m.setup2FA(req.user!.userId));
  res.json({ success: true, data });
});

export const verify2FA = asyncHandler(async (req: Request, res: Response) => {
  const data = await import('../services/twoFactor.service').then((m) =>
    m.verify2FA(req.user!.userId, req.body.token)
  );
  res.json({ success: true, data });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getMe(req.user!.userId, req.user!.orgId, req.user!.role);
  res.json({ success: true, message: 'User fetched successfully', data: result });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyEmail(req.query.token as string);
  res.json({ success: true, ...result });
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resendVerification(req.body.email);
  res.json({ success: true, ...result });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json({ success: true, ...result });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  res.json({ success: true, ...result });
});

export const switchOrg = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.switchOrganization(req.user!.userId, req.body.orgId);
  res.json({ success: true, message: 'Organization switched', data: result });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.updateProfile(req.user!.userId, req.body);
  res.json({ success: true, message: 'Profile updated', data });
});

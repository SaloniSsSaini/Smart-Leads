import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model';
import { Token } from '../models/Token.model';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../types/express';
import * as orgService from './org.service';
import * as emailService from './email.service';

const SALT_ROUNDS = 10;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId: string;
  orgName: string;
  emailVerified: boolean;
  locale: 'en' | 'hi';
  onboardingDone: boolean;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
  organizations: { id: string; name: string; plan: string; role: UserRole }[];
}

const signToken = (userId: string, role: UserRole, orgId: string): string =>
  jwt.sign({ userId, role, orgId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);

const toAuthUser = async (user: IUser, orgId: string, role: UserRole): Promise<AuthUser> => {
  const orgs = await orgService.getUserOrganizations(user._id.toString());
  const current = orgs.find((o) => o.id === orgId);
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role,
    orgId,
    orgName: current?.name ?? 'Organization',
    emailVerified: user.emailVerified,
    locale: user.locale,
    onboardingDone: user.onboardingDone,
  };
};

const buildAuthResult = async (user: IUser, orgId: string, role: UserRole): Promise<AuthResult> => {
  const organizations = await orgService.getUserOrganizations(user._id.toString());
  return {
    token: signToken(user._id.toString(), role, orgId),
    user: await toAuthUser(user, orgId, role),
    organizations,
  };
};

const createToken = async (userId: string, type: 'email_verify' | 'password_reset', hours: number) => {
  await Token.deleteMany({ userId, type });
  const token = crypto.randomBytes(32).toString('hex');
  await Token.create({
    userId,
    token,
    type,
    expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
  });
  return token;
};

export const register = async (
  name: string,
  email: string,
  password: string,
  orgName?: string
): Promise<AuthResult & { message: string }> => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(400, 'Email already registered');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    name,
    email,
    password: hashed,
    emailVerified: env.skipEmailVerification,
  });

  const org = await orgService.createOrganizationForUser(
    user._id.toString(),
    orgName || `${name}'s Team`,
    'admin'
  );

  if (!env.skipEmailVerification) {
    const token = await createToken(user._id.toString(), 'email_verify', 24);
    await emailService.sendVerificationEmail(user.email, token);
  }

  const role = await orgService.getMemberRole(user._id.toString(), org._id.toString());
  const result = await buildAuthResult(user, org._id.toString(), role);

  return {
    ...result,
    message: env.skipEmailVerification
      ? 'Registration successful'
      : 'Registration successful. Please check your email to verify your account.',
  };
};

export const login = async (
  email: string,
  password: string,
  totpToken?: string
): Promise<AuthResult> => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+totpSecret');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new ApiError(401, 'Invalid email or password');

  if (user.twoFactorEnabled) {
    const twoFactor = await import('./twoFactor.service');
    const ok = totpToken ? await twoFactor.validate2FA(user._id.toString(), totpToken) : false;
    if (!ok) throw new ApiError(401, '2FA code required or invalid');
  }

  if (!user.emailVerified && !env.skipEmailVerification) {
    throw new ApiError(403, 'Please verify your email before logging in');
  }

  const orgId = user.currentOrganizationId?.toString();
  if (!orgId) throw new ApiError(400, 'No organization found');

  const role = await orgService.getMemberRole(user._id.toString(), orgId);
  return buildAuthResult(user, orgId, role);
};

export const getMe = async (userId: string, orgId: string, role: UserRole): Promise<AuthResult> => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  return buildAuthResult(user, orgId, role);
};

export const verifyEmail = async (token: string): Promise<{ message: string }> => {
  const record = await Token.findOne({ token, type: 'email_verify', expiresAt: { $gt: new Date() } });
  if (!record) throw new ApiError(400, 'Invalid or expired verification link');

  await User.findByIdAndUpdate(record.userId, { emailVerified: true });
  await Token.deleteOne({ _id: record._id });

  return { message: 'Email verified successfully. You can now log in.' };
};

export const resendVerification = async (email: string): Promise<{ message: string }> => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return { message: 'If the email exists, a verification link was sent.' };
  if (user.emailVerified) throw new ApiError(400, 'Email already verified');

  const token = await createToken(user._id.toString(), 'email_verify', 24);
  await emailService.sendVerificationEmail(user.email, token);
  return { message: 'Verification email sent.' };
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return { message: 'If the email exists, a reset link was sent.' };

  const token = await createToken(user._id.toString(), 'password_reset', 1);
  await emailService.sendPasswordResetEmail(user.email, token);
  return { message: 'Password reset email sent.' };
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
  const record = await Token.findOne({ token, type: 'password_reset', expiresAt: { $gt: new Date() } });
  if (!record) throw new ApiError(400, 'Invalid or expired reset link');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  await User.findByIdAndUpdate(record.userId, { password: hashed });
  await Token.deleteOne({ _id: record._id });

  return { message: 'Password reset successfully. You can now log in.' };
};

export const switchOrganization = async (
  userId: string,
  orgId: string
): Promise<AuthResult> => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new ApiError(404, 'User not found');

  const { role } = await orgService.switchOrganization(userId, orgId);
  return buildAuthResult(user, orgId, role);
};

export const updateProfile = async (
  userId: string,
  data: { locale?: 'en' | 'hi'; onboardingDone?: boolean }
): Promise<Partial<AuthUser>> => {
  const user = await User.findByIdAndUpdate(userId, data, { new: true }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  return {
    locale: user.locale,
    onboardingDone: user.onboardingDone,
  };
};

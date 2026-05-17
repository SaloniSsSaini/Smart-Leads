import { generateSecret, generate, verify } from 'otplib';
import QRCode from 'qrcode';
import { User } from '../models/User.model';
import { ApiError } from '../utils/ApiError';

export const setup2FA = async (userId: string) => {
  const secret = generateSecret();
  await User.findByIdAndUpdate(userId, { totpSecret: secret });
  const user = await User.findById(userId);
  const label = encodeURIComponent(`Smart Leads:${user!.email}`);
  const qrCode = await QRCode.toDataURL(
    `otpauth://totp/${label}?secret=${secret}&issuer=Smart%20Leads`
  );
  return { secret, qrCode };
};

export const verify2FA = async (userId: string, token: string) => {
  const user = await User.findById(userId).select('+totpSecret');
  if (!user?.totpSecret) throw new ApiError(400, '2FA not initialized');
  const valid = verify({ token, secret: user.totpSecret });
  if (!valid) throw new ApiError(400, 'Invalid code');
  user.twoFactorEnabled = true;
  await user.save();
  return { enabled: true };
};

export const validate2FA = async (userId: string, token: string) => {
  const user = await User.findById(userId).select('+totpSecret');
  if (!user?.twoFactorEnabled || !user.totpSecret) return true;
  return verify({ token, secret: user.totpSecret });
};

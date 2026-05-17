import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  switchOrgSchema,
  updateProfileSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

router.use(authenticate);
router.get('/me', authController.getMe);
router.post('/switch-org', validate(switchOrgSchema), authController.switchOrg);
router.patch('/profile', validate(updateProfileSchema), authController.updateProfile);
router.post('/2fa/setup', authController.setup2FA);
router.post('/2fa/verify', authController.verify2FA);

export default router;

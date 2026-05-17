import { Router } from 'express';
import * as inviteController from '../controllers/invite.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();
router.use(authenticate);
router.get('/', requireRole('admin'), inviteController.list);
router.post('/', requireRole('admin'), validate(z.object({ email: z.string().email(), role: z.enum(['admin', 'sales']).optional() })), inviteController.create);
router.post('/accept', validate(z.object({ token: z.string() })), inviteController.accept);
export default router;

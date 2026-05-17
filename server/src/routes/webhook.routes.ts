import { Router } from 'express';
import * as webhookController from '../controllers/webhook.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();
router.use(authenticate);
router.get('/', requireRole('admin'), webhookController.list);
router.post('/', requireRole('admin'), validate(z.object({ url: z.string().url(), events: z.array(z.string()) })), webhookController.create);
router.delete('/:id', requireRole('admin'), webhookController.remove);
export default router;

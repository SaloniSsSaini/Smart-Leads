import { Router } from 'express';
import * as auditController from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);
router.get('/', requireRole('admin'), auditController.list);
export default router;

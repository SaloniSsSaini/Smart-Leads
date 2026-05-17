import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);
router.get('/', settingsController.getOrgSettings);
router.patch('/branding', requireRole('admin'), settingsController.updateBranding);
router.get('/team', settingsController.getTeam);
router.patch('/team/:memberId/permissions', requireRole('admin'), settingsController.updateMemberPermissions);
export default router;

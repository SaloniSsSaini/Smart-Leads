import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import leadRoutes from './lead.routes';
import orgRoutes from './org.routes';
import notificationRoutes from './notification.routes';
import billingRoutes from './billing.routes';
import searchRoutes from './search.routes';
import inviteRoutes from './invite.routes';
import auditRoutes from './audit.routes';
import settingsRoutes from './settings.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'API is running', data: { status: 'ok' } });
});

router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/organizations', orgRoutes);
router.use('/notifications', notificationRoutes);
router.use('/billing', billingRoutes);
router.use('/search', searchRoutes);
router.use('/invites', inviteRoutes);
router.use('/audit', auditRoutes);
router.use('/settings', settingsRoutes);
router.use('/webhooks', webhookRoutes);

export default router;

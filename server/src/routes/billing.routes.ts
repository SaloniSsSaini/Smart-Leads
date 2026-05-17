import { Router } from 'express';
import * as billingController from '../controllers/billing.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { checkoutSchema } from '../validators/billing.validator';

const router = Router();
router.get('/plans', billingController.getPlans);
router.use(authenticate);
router.get('/subscription', billingController.getSubscription);
router.post('/checkout', requireRole('admin'), validate(checkoutSchema), billingController.checkout);
export default router;

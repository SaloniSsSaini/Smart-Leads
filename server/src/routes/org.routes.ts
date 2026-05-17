import { Router } from 'express';
import * as orgController from '../controllers/org.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createOrgSchema } from '../validators/org.validator';

const router = Router();
router.use(authenticate);
router.get('/', orgController.listOrgs);
router.post('/', validate(createOrgSchema), orgController.createOrg);
export default router;

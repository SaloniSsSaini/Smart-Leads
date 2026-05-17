import { Router } from 'express';
import * as leadController from '../controllers/lead.controller';
import * as noteController from '../controllers/note.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createLeadSchema,
  updateLeadSchema,
  listLeadsQuerySchema,
  exportLeadsQuerySchema,
  leadIdParamSchema,
  bulkUpdateSchema,
  importCsvSchema,
  noteBodySchema,
} from '../validators/lead.validator';

const router = Router();
router.use(authenticate);

router.get('/stats', leadController.getStats);
router.get('/kanban', leadController.getKanban);
router.get('/archived', requireRole('admin'), leadController.getArchived);
router.get('/export', validate(exportLeadsQuerySchema, 'query'), leadController.exportLeads);
router.post('/import', validate(importCsvSchema), leadController.importCsv);
router.post('/bulk', validate(bulkUpdateSchema), leadController.bulkUpdate);
router.get('/', validate(listLeadsQuerySchema, 'query'), leadController.getLeads);
router.post('/', validate(createLeadSchema), leadController.createLead);
router.get('/:id/notes', validate(leadIdParamSchema, 'params'), noteController.list);
router.post('/:id/notes', validate(leadIdParamSchema, 'params'), validate(noteBodySchema), noteController.create);
router.get('/:id/activities', validate(leadIdParamSchema, 'params'), leadController.getActivities);
router.patch('/:id/restore', requireRole('admin'), validate(leadIdParamSchema, 'params'), leadController.restoreLead);
router.get('/:id', validate(leadIdParamSchema, 'params'), leadController.getLeadById);
router.patch('/:id', validate(leadIdParamSchema, 'params'), validate(updateLeadSchema), leadController.updateLead);
router.delete('/:id', validate(leadIdParamSchema, 'params'), requireRole('admin'), leadController.deleteLead);

export default router;

/**
 * ==========================================================
 * FILE: src/routes/report.routes.js
 * ==========================================================
 */

import { Router } from 'express';
import { createReport, getMyReports, triggerSOS } from '../controllers/report.controller.js';
import { createReportValidator, listReportsValidator } from '../validators/report.validator.js';
import validate from '../middleware/validate.js';
import protect from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/', createReportValidator, validate, createReport);
router.get('/my', listReportsValidator, validate, getMyReports);
router.post('/sos', triggerSOS);

export default router;

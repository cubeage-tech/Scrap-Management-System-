import express from 'express';
import * as reportsController from './reports.controller.js';
import requireAuth from '../../core/middlewares/auth.middleware.js';
import { allowRoles } from '../../core/middlewares/role.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/industry', allowRoles('INDUSTRY'), reportsController.getIndustryReports);
router.get('/dealer', allowRoles('DEALER'), reportsController.getDealerReports);
router.get('/buyer', allowRoles('BUYER'), reportsController.getBuyerReports);
router.get('/admin', allowRoles('SUPER_ADMIN'), reportsController.getAdminReports);

export default router;


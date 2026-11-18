import express from 'express';
import * as industryController from './industry.controller.js';
import requireAuth from '../../core/middlewares/auth.middleware.js';
import { allowRoles } from '../../core/middlewares/role.middleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(allowRoles('INDUSTRY'));

router.get('/dashboard', industryController.getDashboardAnalytics);

export default router;


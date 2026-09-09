import express from 'express';
import * as categoryController from './category.controller.js';
import requireAuth from '../../core/middlewares/auth.middleware.js';
import { allowRoles } from '../../core/middlewares/role.middleware.js';

const router = express.Router();

// Require auth for all category routes
router.use(requireAuth);

// 1. Specific Named Routes
router.get('/all', allowRoles('SUPER_ADMIN'), categoryController.getAllCategories);

// 2. ID-based Routes
router.get('/:id', (req, res, next) => {
  if (req.params.id === 'all') return next();
  return categoryController.getCategoryById(req, res, next);
});

router.patch('/:id', allowRoles('SUPER_ADMIN'), categoryController.updateCategory);
router.delete('/:id', allowRoles('SUPER_ADMIN'), categoryController.deleteCategory);

// 3. Root & Empty-Path Handlers (handles both /api/category and /api/category/)
router.route('/')
  .get(categoryController.getCategories)
  .post(allowRoles('SUPER_ADMIN', 'INDUSTRY', 'DEALER'), categoryController.createCategory);

router.route('')
  .get(categoryController.getCategories)
  .post(allowRoles('SUPER_ADMIN', 'INDUSTRY', 'DEALER'), categoryController.createCategory);

export default router;

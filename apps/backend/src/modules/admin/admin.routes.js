import express from "express";
import auth from "../../core/middlewares/auth.middleware.js";
import { allowRoles } from "../../core/middlewares/role.middleware.js";
import AdminController from "./admin.controller.js";

const router = express.Router();

// All admin routes require authentication and SUPER_ADMIN role
router.use(auth);
router.use(allowRoles("SUPER_ADMIN"));

// =========================================================
// DASHBOARD ANALYTICS
// =========================================================

// GET /admin/dashboard - Get dashboard analytics
router.get("/dashboard", AdminController.getDashboardAnalytics);

// =========================================================
// INDUSTRIES ROUTES
// =========================================================

// GET /admin/industries - Get all industries
router.get("/industries", AdminController.getIndustries);

// GET /admin/industries/:id - Get single industry
router.get("/industries/:id", AdminController.getIndustryById);

// PATCH /admin/industries/:id/status - Approve/Reject industry
router.patch("/industries/:id/status", AdminController.updateIndustryStatus);

// =========================================================
// DEALERS ROUTES
// =========================================================

// GET /admin/dealers - Get all dealers
router.get("/dealers", AdminController.getDealers);

// PATCH /admin/dealers/:id/status - Approve/Reject dealer
router.patch("/dealers/:id/status", AdminController.updateDealerStatus);

// =========================================================
// BUYERS ROUTES
// =========================================================

// GET /admin/buyers - Get all buyers
router.get("/buyers", AdminController.getBuyers);

// PATCH /admin/buyers/:id/status - Approve/Reject buyer
router.patch("/buyers/:id/status", AdminController.updateBuyerStatus);

export default router;

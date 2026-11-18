import express from "express";
import * as notificationController from "./notification.controller.js";
import requireAuth from "../../core/middlewares/auth.middleware.js";

const router = express.Router();

// Require authentication for all notification routes
router.use(requireAuth);

router.get("/", notificationController.getUserNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

export default router;


import express from "express";
import * as authController from "./auth.controller.js";
import { loginRateLimiter, forgotPasswordRateLimiter } from "../../core/middlewares/rateLimiter.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", loginRateLimiter, authController.login);
router.post("/logout", ...authController.logout);
router.post("/forgot-password", forgotPasswordRateLimiter, authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

export default router;
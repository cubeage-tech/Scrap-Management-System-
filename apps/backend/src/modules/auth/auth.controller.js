import * as authService from "./auth.service.js";
import requireAuth from "../../core/middlewares/auth.middleware.js";


export const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Waiting for admin approval.",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const clientBaseUrl =
      process.env.CLIENT_BASE_URL ||
      (process.env.CLIENT_URLS || "http://localhost:5173").split(",")[0].trim();

    await authService.forgotPassword(email, clientBaseUrl);

    return res.status(200).json({
      success: true,
      message: "If that email is registered, a password reset link has been sent.",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }
    await authService.resetPassword(token, password);
    return res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) {
    return res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

export const logout = [
  requireAuth,
  async (req, res) => {
    try {
      await authService.logout(req.user.id);
      return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
];
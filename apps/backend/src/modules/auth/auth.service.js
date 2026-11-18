import prisma from "../../core/lib/prisma.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { signToken } from "../../core/utils/jwt.js";
import { sendPasswordResetEmail } from "../../core/utils/mailer.js";

const allowedRoles = ["INDUSTRY", "DEALER", "BUYER"];

/**
 * ==========================
 * Register
 * ==========================
 */
export const register = async (body) => {
  const {
    role,
    companyName,
    gstNumber,
    contactName,
    phone,
    email,
    password,
    address,
    city,
    state,
    pincode,
  } = body;

  // Validate Role
  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role");
  }

  // Validate email format
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !EMAIL_RE.test(email)) {
    const err = new Error("Invalid email format");
    err.statusCode = 400;
    throw err;
  }

  // Check Email
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Check GST (Optional)
  if (gstNumber) {
    const existingGST = await prisma.organisation.findUnique({
      where: {
        gstNumber,
      },
    });

    if (existingGST) {
      throw new Error("GST Number already exists");
    }
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Transaction
  const result = await prisma.$transaction(async (tx) => {
    const organisation = await tx.organisation.create({
      data: {
        companyName,
        businessType: role,
        gstNumber: gstNumber || null,
        address,
        city,
        state,
        pincode,
        contactName,
        contactPhone: phone,
      },
    });

    const user = await tx.user.create({
      data: {
        organisationId: organisation.id,
        contactName,
        email,
        phoneNumber: phone,
        password: hashedPassword,
        role,
      },
    });

    return {
      id: user.id,
      organisationId: organisation.id,
      contactName: user.contactName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      organisationStatus: organisation.accountState,
    };
  });

  return result;
};

/**
 * ==========================
 * Login
 * ==========================
 */
export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      organisation: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }

  if (user.organisation.accountState === "PENDING") {
    throw new Error(
      "Your account is waiting for admin approval."
    );
  }

  if (user.organisation.accountState === "REJECTED") {
    throw new Error(
      "Your account has been rejected."
    );
  }

  if (user.organisation.accountState === "SUSPENDED") {
    throw new Error(
      "Your account has been suspended."
    );
  }

  const token = signToken({
    id: user.id,
    organisationId: user.organisationId,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      organisationId: user.organisationId,
      contactName: user.contactName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isActive: user.isActive,
      organisation: {
        id: user.organisation.id,
        companyName: user.organisation.companyName,
        businessType: user.organisation.businessType,
        accountState: user.organisation.accountState,
      },
    },
  };
};

/**
 * ==========================
 * Forgot Password
 * ==========================
 */
export const forgotPassword = async (email, clientBaseUrl) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond the same way to avoid email enumeration
  if (!user) return;

  // Invalidate any existing unused tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetUrl = `${clientBaseUrl}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(email, resetUrl);
};

/**
 * ==========================
 * Reset Password
 * ==========================
 */
export const resetPassword = async (rawToken, newPassword) => {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const record = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null },
  });

  if (!record) {
    const err = new Error("Invalid or expired reset token");
    err.statusCode = 400;
    throw err;
  }

  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: record.id } });
    const err = new Error("Reset token has expired. Please request a new one.");
    err.statusCode = 400;
    throw err;
  }

  if (newPassword.length < 6) {
    const err = new Error("Password must be at least 6 characters");
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Revoke all refresh tokens so existing sessions are invalidated
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
};

/**
 * ==========================
 * Logout
 * ==========================
 */
export const logout = async (userId) => {
  // Revoke all active refresh tokens for this user
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};
// One-off script to create the platform's SUPER_ADMIN account.
// Signup (auth.service.js) only allows INDUSTRY/DEALER/BUYER, so this is the
// only way to get a SUPER_ADMIN user into the database.
//
// Usage:
//   npm run seed:admin
//   ADMIN_EMAIL=you@company.com ADMIN_PASSWORD=SomeStrongPass npm run seed:admin
//
// Safe to re-run: if a SUPER_ADMIN with the given email already exists, it
// does nothing instead of erroring or creating a duplicate.

import bcrypt from "bcrypt";
import dotenv from "dotenv";
import prisma from "../src/core/lib/prisma.js";

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@smartscrap.ai";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";
const ADMIN_NAME = process.env.ADMIN_NAME || "Platform Admin";
const ADMIN_PHONE = process.env.ADMIN_PHONE || "9999999999";

async function seedAdmin() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    if (existing.role !== "SUPER_ADMIN") {
      throw new Error(
        `A user with email "${ADMIN_EMAIL}" already exists with role "${existing.role}". ` +
          `Set ADMIN_EMAIL to a different address and re-run.`
      );
    }
    console.log(`Super admin already exists (${ADMIN_EMAIL}) — nothing to do.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.$transaction(async (tx) => {
    const organisation = await tx.organisation.create({
      data: {
        companyName: "SmartScrap AI Platform",
        businessType: "PLATFORM",
        address: "Platform HQ",
        city: "Mumbai",
        state: "MH",
        pincode: "400001",
        contactName: ADMIN_NAME,
        contactPhone: ADMIN_PHONE,
        accountState: "ACTIVE",
        approvedAt: new Date(),
      },
    });

    await tx.user.create({
      data: {
        organisationId: organisation.id,
        contactName: ADMIN_NAME,
        email: ADMIN_EMAIL,
        phoneNumber: ADMIN_PHONE,
        password: hashedPassword,
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });
  });

  console.log("Super admin account created:");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log("Log in and change this password before going to production.");
}

seedAdmin()
  .catch((err) => {
    console.error("Failed to seed admin account:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

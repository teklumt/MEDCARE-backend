import bcrypt from "bcrypt";
import { Admin } from "../models/Admin.js";
import { logger } from "./logger.js";

export const seedSuperAdmin = async (email?: string, password?: string): Promise<void> => {
  if (!email || !password) return;

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.create({
    fullName: "Super Admin",
    email: email.toLowerCase(),
    passwordHash,
    role: "super_admin",
    permissions: ["*"],
    status: "active",
    mfa: { enabled: false },
  });

  logger.info("Super admin seeded", { email });
};

import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { logger } from "./logger.js";

export const seedSuperAdmin = async (email?: string, password?: string): Promise<void> => {
  if (!email || !password) return;

  const existing = await User.findOne({ email: email.toLowerCase(), role: "admin" });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    username: "super_admin",
    email: email.toLowerCase(),
    phone: "+251000000000",
    passwordHash,
    role: "admin",
    permissions: ["*"],
    isActive: true,
    isLocked: false,
    mfa: { enabled: false },
  } as any);

  logger.info("Super admin seeded", { email });
};

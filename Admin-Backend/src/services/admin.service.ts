import bcrypt from "bcrypt";
import { adminRepository } from "../repositories/admin.repository.js";

export const adminService = {
  async createAdmin(payload: {
    username: string;
    email: string;
    phone: string;
    password: string;
    permissions?: string[];
    createdBy?: string;
  }) {
    const existing = await adminRepository.findByEmail(payload.email);
    if (existing) {
      return { error: { message: "Email already exists", code: "EMAIL_EXISTS", status: 409 } };
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const admin = await adminRepository.create({
      username: payload.username,
      email: payload.email.toLowerCase(),
      phone: payload.phone,
      passwordHash,
      role: "admin",
      permissions: payload.permissions ?? ["*"],
      createdBy: payload.createdBy as any,
    } as any);

    return { data: admin };
  },

  async listAdmins(filter: Record<string, unknown>, skip: number, limit: number) {
    const [items, total] = await adminRepository.listPaginated(filter, skip, limit);
    return { items, total };
  },

  async updateRole(id: string, role: "admin") {
    const admin = await adminRepository.findById(id);
    if (!admin) {
      return { error: { message: "Admin not found", code: "NOT_FOUND", status: 404 } };
    }

    admin.role = role;
    await adminRepository.save(admin);
    return { data: admin };
  },

  async suspend(id: string, reason: string) {
    const admin = await adminRepository.findById(id);
    if (!admin) {
      return { error: { message: "Admin not found", code: "NOT_FOUND", status: 404 } };
    }

    (admin as any).isActive = false;
    (admin as any).suspendedReason = reason;
    await adminRepository.save(admin);
    return { data: admin };
  },

  async softDelete(id: string) {
    const admin = await adminRepository.findById(id);
    if (!admin) {
      return { error: { message: "Admin not found", code: "NOT_FOUND", status: 404 } };
    }

    (admin as any).isActive = false;
    await adminRepository.save(admin);
    return { data: admin };
  },
};

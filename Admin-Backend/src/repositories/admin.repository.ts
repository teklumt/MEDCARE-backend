import { Admin, type IAdmin } from "../models/Admin.js";

export const adminRepository = {
  findByEmail(email: string): Promise<IAdmin | null> {
    return Admin.findOne({ email: email.toLowerCase(), deletedAt: { $exists: false } });
  },

  create(payload: Partial<IAdmin>): Promise<IAdmin> {
    return Admin.create(payload);
  },

  findById(id: string): Promise<IAdmin | null> {
    return Admin.findById(id);
  },

  save(admin: IAdmin): Promise<IAdmin> {
    return admin.save();
  },

  listPaginated(filter: Record<string, unknown>, skip: number, limit: number) {
    return Promise.all([
      Admin.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Admin.countDocuments(filter),
    ]);
  },
};

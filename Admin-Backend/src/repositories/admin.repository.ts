import { User, type IUser } from "../models/User.js";

export const adminRepository = {
  findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase(), role: "admin" });
  },

  create(payload: Partial<IUser>): Promise<IUser> {
    return User.create(payload);
  },

  findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  },

  save(admin: IUser): Promise<IUser> {
    return admin.save();
  },

  listPaginated(filter: Record<string, unknown>, skip: number, limit: number) {
    return Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
  },
};

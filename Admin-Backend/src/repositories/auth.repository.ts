import { User, type IUser } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";

export const authRepository = {
  findActiveAdminByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase(), role: "admin", isActive: true });
  },

  findAdminById(id: string): Promise<IUser | null> {
    return User.findOne({ _id: id, role: "admin" });
  },

  saveAdmin(admin: IUser): Promise<IUser> {
    return admin.save();
  },

  createRefreshToken(adminId: string, tokenHash: string, expiresAt: Date) {
    return RefreshToken.create({
      adminId,
      tokenHash,
      expiresAt,
      isRevoked: false,
    });
  },

  findValidRefreshToken(adminId: string, tokenHash: string) {
    return RefreshToken.findOne({
      adminId,
      tokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
  },

  async revokeTokenDoc(tokenDocId: string): Promise<void> {
    await RefreshToken.updateOne({ _id: tokenDocId }, { $set: { isRevoked: true } });
  },

  async revokeByTokenAndAdmin(tokenHash: string, adminId: string): Promise<void> {
    await RefreshToken.updateMany({ tokenHash, adminId }, { $set: { isRevoked: true } });
  },
};

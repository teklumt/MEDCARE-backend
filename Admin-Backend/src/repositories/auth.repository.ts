import { Admin, type IAdmin } from "../models/Admin.js";
import { RefreshToken } from "../models/RefreshToken.js";

export const authRepository = {
  findActiveAdminByEmail(email: string): Promise<IAdmin | null> {
    return Admin.findOne({ email: email.toLowerCase(), status: "active" });
  },

  findAdminById(id: string): Promise<IAdmin | null> {
    return Admin.findById(id);
  },

  saveAdmin(admin: IAdmin): Promise<IAdmin> {
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

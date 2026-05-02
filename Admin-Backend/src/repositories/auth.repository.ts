import { User, type IUser } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";

export const authRepository = {
  findActiveUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase(), isActive: true });
  },

  findUserById(id: string): Promise<IUser | null> {
    return User.findOne({ _id: id });
  },

  saveUser(user: IUser): Promise<IUser> {
    return user.save();
  },

  createRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return RefreshToken.create({
      adminId: userId, // Keep the field name for compatibility
      tokenHash,
      expiresAt,
      isRevoked: false,
    });
  },

  findValidRefreshToken(userId: string, tokenHash: string) {
    return RefreshToken.findOne({
      adminId: userId, // Keep the field name for compatibility
      tokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
  },

  async revokeTokenDoc(tokenDocId: string): Promise<void> {
    await RefreshToken.updateOne({ _id: tokenDocId }, { $set: { isRevoked: true } });
  },

  async revokeByTokenAndUser(tokenHash: string, userId: string): Promise<void> {
    await RefreshToken.updateMany({ tokenHash, adminId: userId }, { $set: { isRevoked: true } });
  },
};

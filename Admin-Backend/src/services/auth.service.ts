import bcrypt from "bcrypt";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { authRepository } from "../repositories/auth.repository.js";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";
import { rolePermissions } from "../types/auth.js";

const refreshTtlMs = 30 * 24 * 60 * 60 * 1000;

export const authService = {
  async login(email: string, password: string, totpCode?: string) {
    const admin = await authRepository.findActiveAdminByEmail(email);
    if (!admin) {
      return { error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS", status: 401 } };
    }

    if (admin.status === "suspended") {
      return {
        error: {
          message: "Account suspended",
          code: "ACCOUNT_SUSPENDED",
          status: 403,
          details: { reason: admin.suspendedReason },
        },
      };
    }

    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      return { error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS", status: 401 } };
    }

    // MFA checks are intentionally disabled for this deployment.
    void totpCode;

    const accessToken = signAccessToken({
      sub: String(admin._id),
      role: admin.role,
      mfa: admin.mfa.enabled,
      permissions: admin.permissions?.length ? admin.permissions : rolePermissions[admin.role],
    });
    const refreshToken = signRefreshToken(String(admin._id));

    await authRepository.createRefreshToken(String(admin._id), hashToken(refreshToken), new Date(Date.now() + refreshTtlMs));

    admin.lastLoginAt = new Date();
    admin.refreshToken = hashToken(refreshToken);
    await authRepository.saveAdmin(admin);

    return {
      data: {
        accessToken,
        refreshToken,
        admin,
      },
    };
  },

  async refresh(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const tokenDoc = await authRepository.findValidRefreshToken(decoded.sub, hashToken(refreshToken));

      if (!tokenDoc) {
        return { error: { message: "Refresh token invalid", code: "TOKEN_INVALID", status: 401 } };
      }

      const admin = await authRepository.findAdminById(decoded.sub);
      if (!admin || admin.status === "suspended") {
        return { error: { message: "Admin unavailable", code: "ADMIN_UNAVAILABLE", status: 401 } };
      }

      await authRepository.revokeTokenDoc(String(tokenDoc._id));

      const newAccessToken = signAccessToken({
        sub: String(admin._id),
        role: admin.role,
        mfa: admin.mfa.enabled,
        permissions: admin.permissions?.length ? admin.permissions : rolePermissions[admin.role],
      });
      const newRefreshToken = signRefreshToken(String(admin._id));

      await authRepository.createRefreshToken(String(admin._id), hashToken(newRefreshToken), new Date(Date.now() + refreshTtlMs));
      admin.refreshToken = hashToken(newRefreshToken);
      await authRepository.saveAdmin(admin);

      return { data: { accessToken: newAccessToken, refreshToken: newRefreshToken, admin } };
    } catch {
      return { error: { message: "Refresh token invalid", code: "TOKEN_INVALID", status: 401 } };
    }
  },

  async logout(adminId: string, refreshToken: string): Promise<void> {
    await authRepository.revokeByTokenAndAdmin(hashToken(refreshToken), adminId);
    const admin = await authRepository.findAdminById(adminId);
    if (admin) {
      admin.refreshToken = undefined;
      await authRepository.saveAdmin(admin);
    }
  },

  async setupMfa(adminId: string, adminEmail: string) {
    const secret = generateSecret();
    const otpauth = generateURI({ issuer: "MED-CARE Ethiopia", label: adminEmail, secret });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

    return { secret, otpauth, qrCodeDataUrl };
  },

  async verifyMfaCode(secret: string, code: string): Promise<boolean> {
    const result = await verify({ token: code, secret });
    return result.valid;
  },
};

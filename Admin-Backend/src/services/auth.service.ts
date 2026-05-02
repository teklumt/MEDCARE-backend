import bcrypt from "bcrypt";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { authRepository } from "../repositories/auth.repository.js";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";
import { allRolePermissions } from "../types/auth.js";

const refreshTtlMs = 30 * 24 * 60 * 60 * 1000;

export const authService = {
  async login(email: string, password: string, totpCode?: string) {
    const admin = await authRepository.findActiveAdminByEmail(email);
    if (!admin) {
      return { error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS", status: 401 } };
    }

    if (!admin.isActive || admin.isLocked) {
      return {
        error: {
          message: "Account unavailable",
          code: "ACCOUNT_UNAVAILABLE",
          status: 403,
          details: { isActive: admin.isActive, isLocked: admin.isLocked },
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
      mfa: admin.mfa?.enabled ?? false,
      permissions: (admin as any).permissions?.length ? (admin as any).permissions : allRolePermissions[admin.role],
    });
    const refreshToken = signRefreshToken(String(admin._id));

    await authRepository.createRefreshToken(String(admin._id), hashToken(refreshToken), new Date(Date.now() + refreshTtlMs));

    (admin as any).lastLoginAt = new Date();
    (admin as any).refreshToken = hashToken(refreshToken);
    await authRepository.saveAdmin(admin);

    return {
      data: {
        user: {
          id: String(admin._id),
          email: admin.email,
          username: admin.username,
          role: admin.role,
          isActive: admin.isActive,
          permissions: (admin as any).permissions?.length ? (admin as any).permissions : allRolePermissions[admin.role],
        },
        tokens: {
          accessToken,
          refreshToken,
        },
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
      if (!admin || !admin.isActive || admin.isLocked) {
        return { error: { message: "Admin unavailable", code: "ADMIN_UNAVAILABLE", status: 401 } };
      }

      await authRepository.revokeTokenDoc(String(tokenDoc._id));

      const newAccessToken = signAccessToken({
        sub: String(admin._id),
        role: admin.role,
        mfa: admin.mfa?.enabled ?? false,
        permissions: (admin as any).permissions?.length ? (admin as any).permissions : allRolePermissions[admin.role],
      });
      const newRefreshToken = signRefreshToken(String(admin._id));

      await authRepository.createRefreshToken(String(admin._id), hashToken(newRefreshToken), new Date(Date.now() + refreshTtlMs));
      (admin as any).refreshToken = hashToken(newRefreshToken);
      await authRepository.saveAdmin(admin);

      return { 
        data: { 
          user: {
            id: String(admin._id),
            email: admin.email,
            username: admin.username,
            role: admin.role,
            isActive: admin.isActive,
            permissions: (admin as any).permissions?.length ? (admin as any).permissions : allRolePermissions[admin.role],
          },
          tokens: {
            accessToken: newAccessToken, 
            refreshToken: newRefreshToken,
          },
        } 
      };
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

import bcrypt from "bcrypt";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { authRepository } from "../repositories/auth.repository.js";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";
import { allRolePermissions } from "../types/auth.js";

const refreshTtlMs = 30 * 24 * 60 * 60 * 1000;

export const authService = {
  async login(email: string, password: string, totpCode?: string) {
    const user = await authRepository.findActiveUserByEmail(email);
    if (!user) {
      return { error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS", status: 401 } };
    }

    if (!user.isActive || user.isLocked) {
      return {
        error: {
          message: "Account unavailable",
          code: "ACCOUNT_UNAVAILABLE",
          status: 403,
          details: { isActive: user.isActive, isLocked: user.isLocked },
        },
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return { error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS", status: 401 } };
    }

    // MFA checks are intentionally disabled for this deployment.
    void totpCode;

    const accessToken = signAccessToken({
      sub: String(user._id),
      role: user.role,
      mfa: user.mfa?.enabled ?? false,
      permissions: (user as any).permissions?.length ? (user as any).permissions : allRolePermissions[user.role],
    });
    const refreshToken = signRefreshToken(String(user._id));

    await authRepository.createRefreshToken(String(user._id), hashToken(refreshToken), new Date(Date.now() + refreshTtlMs));

    (user as any).lastLoginAt = new Date();
    (user as any).refreshToken = hashToken(refreshToken);
    await authRepository.saveUser(user);

    return {
      data: {
        user: {
          id: String(user._id),
          email: user.email,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          permissions: (user as any).permissions?.length ? (user as any).permissions : allRolePermissions[user.role],
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

      const user = await authRepository.findUserById(decoded.sub);
      if (!user || !user.isActive || user.isLocked) {
        return { error: { message: "User unavailable", code: "USER_UNAVAILABLE", status: 401 } };
      }

      await authRepository.revokeTokenDoc(String(tokenDoc._id));

      const newAccessToken = signAccessToken({
        sub: String(user._id),
        role: user.role,
        mfa: user.mfa?.enabled ?? false,
        permissions: (user as any).permissions?.length ? (user as any).permissions : allRolePermissions[user.role],
      });
      const newRefreshToken = signRefreshToken(String(user._id));

      await authRepository.createRefreshToken(String(user._id), hashToken(newRefreshToken), new Date(Date.now() + refreshTtlMs));
      (user as any).refreshToken = hashToken(newRefreshToken);
      await authRepository.saveUser(user);

      return { 
        data: { 
          user: {
            id: String(user._id),
            email: user.email,
            username: user.username,
            role: user.role,
            isActive: user.isActive,
            permissions: (user as any).permissions?.length ? (user as any).permissions : allRolePermissions[user.role],
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

  async logout(userId: string, refreshToken: string): Promise<void> {
    await authRepository.revokeByTokenAndUser(hashToken(refreshToken), userId);
    const user = await authRepository.findUserById(userId);
    if (user) {
      user.refreshToken = undefined;
      await authRepository.saveUser(user);
    }
  },

  async setupMfa(userId: string, userEmail: string) {
    const secret = generateSecret();
    const otpauth = generateURI({ issuer: "MED-CARE Ethiopia", label: userEmail, secret });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

    return { secret, otpauth, qrCodeDataUrl };
  },

  async verifyMfaCode(secret: string, code: string): Promise<boolean> {
    const result = await verify({ token: code, secret });
    return result.valid;
  },
};

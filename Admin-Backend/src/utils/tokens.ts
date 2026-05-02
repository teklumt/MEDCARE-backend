import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AdminRole, UserRole } from "../types/auth.js";

export type AccessPayload = {
  sub: string;
  role: UserRole;
  mfa: boolean;
  permissions: string[];
};

export const signAccessToken = (payload: AccessPayload): string =>
  jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
    issuer: env.appUrl,
    audience: env.appUrl,
  } as SignOptions);

export const signRefreshToken = (adminId: string): string =>
  jwt.sign({ sub: adminId, typ: "refresh" }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
    issuer: env.appUrl,
    audience: env.appUrl,
  } as SignOptions);

export const verifyAccessToken = (token: string): AccessPayload =>
  jwt.verify(token, env.jwtAccessSecret, {
    issuer: env.appUrl,
    audience: env.appUrl,
  }) as AccessPayload;

export const verifyRefreshToken = (token: string): { sub: string; typ: string } =>
  jwt.verify(token, env.jwtRefreshSecret, {
    issuer: env.appUrl,
    audience: env.appUrl,
  }) as { sub: string; typ: string };

export const hashToken = (token: string): string => crypto.createHash("sha256").update(token).digest("hex");

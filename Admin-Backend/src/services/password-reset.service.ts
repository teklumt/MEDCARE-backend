import bcrypt from "bcrypt";
import crypto from "crypto";
import { PasswordResetVerification } from "../models/PasswordResetVerification.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { authRepository } from "../repositories/auth.repository.js";
import { sendMailStrict, isSmtpConfigured, buildEmailHtml, otpBlock } from "../utils/mailer.js";
import { env } from "../config/env.js";

const BCRYPT_ROUNDS = 10;
const CODE_TTL_MS = 15 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

export type PasswordResetErrorCode =
  | "SMTP_NOT_CONFIGURED"
  | "INVALID_CODE"
  | "EXPIRED"
  | "TOO_MANY_ATTEMPTS"
  | "NOT_FOUND"
  | "EMAIL_SEND_FAILED"
  | "WEAK_PASSWORD";

export type SendForgotPasswordResult =
  | { ok: true }
  | { ok: false; code: PasswordResetErrorCode; message: string; diagnostic?: string };

export type ResetPasswordResult =
  | { ok: true; userId: string }
  | { ok: false; code: PasswordResetErrorCode; message: string };

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function mailSubjectAndHtml(plainCode: string): { subject: string; html: string } {
  const subject = "Your MED-CARE password reset code";
  const html = buildEmailHtml({
    title: "Reset your password",
    preheader: "Use this code to reset your MED-CARE password.",
    body: `
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Reset your password</h2>
      <p style="margin:0 0 20px;color:#6b7280;font-size:15px;">
        We received a request to reset your MED-CARE account password.
        Use the code below to complete the process.
      </p>
      ${otpBlock(plainCode)}
      <p style="margin:0;color:#6b7280;font-size:13px;">
        This code expires in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
      </p>
    `,
  });
  return { subject, html };
}

export const passwordResetService = {
  /**
   * Sends 6-digit OTP if an active account exists with this email (always same outward success to prevent enumeration).
   */
  async requestCode(rawEmail: string): Promise<SendForgotPasswordResult> {
    const email = normalizeEmail(rawEmail);

    if (!isSmtpConfigured()) {
      return {
        ok: false,
        code: "SMTP_NOT_CONFIGURED",
        message: "Password reset email is temporarily unavailable. Please try again later.",
      };
    }

    const user = await authRepository.findActiveUserByEmail(email);
    if (!user) {
      return { ok: true };
    }

    const codeNum = crypto.randomInt(100000, 1000000);
    const plain = String(codeNum).padStart(6, "0");
    const codeHash = await bcrypt.hash(plain, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    await PasswordResetVerification.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          codeHash,
          expiresAt,
          attempts: 0,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );

    const { subject, html } = mailSubjectAndHtml(plain);

    try {
      await sendMailStrict(email, subject, html);
    } catch (cause: unknown) {
      await PasswordResetVerification.deleteMany({ email });
      const diagnostic =
        env.nodeEnv !== "production"
          ? cause instanceof Error
            ? cause.message
            : String(cause)
          : undefined;
      return {
        ok: false,
        code: "EMAIL_SEND_FAILED",
        message: "Could not send reset email. Please try again.",
        ...(diagnostic ? { diagnostic } : {}),
      };
    }

    return { ok: true };
  },

  async resetWithCode(rawEmail: string, plainCode: string, newPassword: string): Promise<ResetPasswordResult> {
    const email = normalizeEmail(rawEmail);
    const trimmed = plainCode.trim();

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return {
        ok: false,
        code: "WEAK_PASSWORD",
        message: "Password must be at least 8 characters.",
      };
    }

    const user = await authRepository.findActiveUserByEmail(email);
    if (!user || user.isLocked) {
      return {
        ok: false,
        code: "INVALID_CODE",
        message: "Invalid or expired verification code.",
      };
    }

    const doc = await PasswordResetVerification.findOne({ email });
    if (!doc) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "Invalid or expired verification code.",
      };
    }

    if (doc.expiresAt.getTime() < Date.now()) {
      await PasswordResetVerification.deleteOne({ _id: doc._id });
      return {
        ok: false,
        code: "EXPIRED",
        message: "Verification code expired. Request a new code.",
      };
    }

    if (doc.attempts >= MAX_VERIFY_ATTEMPTS) {
      return {
        ok: false,
        code: "TOO_MANY_ATTEMPTS",
        message: "Too many incorrect attempts. Request a new code.",
      };
    }

    const match = await bcrypt.compare(trimmed, doc.codeHash);
    if (!match) {
      doc.attempts += 1;
      await doc.save();
      return {
        ok: false,
        code: "INVALID_CODE",
        message: "Invalid verification code.",
      };
    }

    await PasswordResetVerification.deleteOne({ _id: doc._id });

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockExpiresAt = null;
    await user.save();

    await RefreshToken.updateMany(
      { adminId: user._id, isRevoked: false },
      { $set: { isRevoked: true } },
    ).catch(() => undefined);

    return { ok: true, userId: String(user._id) };
  },
};

import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  PharmacySignupVerification,
  type SignupVerificationPurpose,
} from "../models/PharmacySignupVerification.js";
import { authRepository } from "../repositories/auth.repository.js";
import { sendMailStrict, isSmtpConfigured, buildEmailHtml, otpBlock } from "../utils/mailer.js";
import { env } from "../config/env.js";

const BCRYPT_ROUNDS = 10;
const CODE_TTL_MS = 15 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

export type PharmacySignupVerifyErrorCode =
  | "SMTP_NOT_CONFIGURED"
  | "DUPLICATE_EMAIL"
  | "INVALID_CODE"
  | "EXPIRED"
  | "TOO_MANY_ATTEMPTS"
  | "NOT_FOUND"
  | "EMAIL_SEND_FAILED";

export type SendCodeResult =
  | { ok: true }
  | { ok: false; code: PharmacySignupVerifyErrorCode; message: string; diagnostic?: string };

export type VerifyConsumeResult =
  | { ok: true }
  | { ok: false; code: PharmacySignupVerifyErrorCode; message: string };

export type { SignupVerificationPurpose };

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/** Filter for upsert / delete-on-failure: pharmacy matches legacy docs without `purpose`. */
function upsertFilter(email: string, purpose: SignupVerificationPurpose): Record<string, unknown> {
  if (purpose === "pharmacy_register") {
    return {
      $or: [{ email, purpose: "pharmacy_register" }, { email, purpose: { $exists: false } }],
    };
  }
  return { email, purpose };
}

function verifyLookupFilter(email: string, purpose: SignupVerificationPurpose): Record<string, unknown> {
  if (purpose === "pharmacy_register") {
    return {
      email,
      $or: [{ purpose: "pharmacy_register" }, { purpose: { $exists: false } }],
    };
  }
  return { email, purpose };
}

function mailContent(purpose: SignupVerificationPurpose, plain: string): { subject: string; html: string } {
  const roleLabel =
    purpose === "pharmacy_register"
      ? "Pharmacy"
      : purpose === "patient_register"
        ? "Patient"
        : "Delivery";
  const subject = `Your MED-CARE ${roleLabel} signup verification code`;
  const html = buildEmailHtml({
    title: `Verify your ${roleLabel} account`,
    preheader: `Your MED-CARE verification code is ${plain}`,
    body: `
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Verify your ${roleLabel} account</h2>
      <p style="margin:0 0 20px;color:#6b7280;font-size:15px;">
        Thanks for signing up for MED-CARE Ethiopia! Enter the code below to verify your email address and complete your registration.
      </p>
      ${otpBlock(plain)}
      <p style="margin:0;color:#6b7280;font-size:13px;">
        This code expires in <strong>15 minutes</strong>. If you did not create an account, you can safely ignore this email.
      </p>
    `,
  });
  return { subject, html };
}

export const pharmacySignupVerificationService = {
  async sendCode(rawEmail: string, purpose: SignupVerificationPurpose): Promise<SendCodeResult> {
    const email = normalizeEmail(rawEmail);

    const existingUser = await authRepository.findUserByEmailAny(email);
    if (existingUser) {
      return {
        ok: false,
        code: "DUPLICATE_EMAIL",
        message: "Email already registered",
      };
    }

    if (!isSmtpConfigured()) {
      return {
        ok: false,
        code: "SMTP_NOT_CONFIGURED",
        message: "Email verification is temporarily unavailable. Please try again later.",
      };
    }

    const codeNum = crypto.randomInt(100000, 1000000);
    const plain = String(codeNum).padStart(6, "0");
    const codeHash = await bcrypt.hash(plain, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);
    const filter = upsertFilter(email, purpose);

    await PharmacySignupVerification.findOneAndUpdate(
      filter,
      {
        $set: {
          email,
          purpose,
          codeHash,
          expiresAt,
          attempts: 0,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );

    const { subject, html } = mailContent(purpose, plain);

    try {
      await sendMailStrict(email, subject, html);
    } catch (cause: unknown) {
      await PharmacySignupVerification.deleteMany(filter as Record<string, unknown>);
      const diagnostic =
        env.nodeEnv !== "production"
          ? cause instanceof Error
            ? cause.message
            : String(cause)
          : undefined;
      return {
        ok: false,
        code: "EMAIL_SEND_FAILED",
        message: "Could not send verification email. Please try again.",
        ...(diagnostic ? { diagnostic } : {}),
      };
    }

    return { ok: true };
  },

  async verifyAndConsume(
    rawEmail: string,
    plainCode: string,
    purpose: SignupVerificationPurpose,
  ): Promise<VerifyConsumeResult> {
    const email = normalizeEmail(rawEmail);
    const trimmed = plainCode.trim();

    const doc = await PharmacySignupVerification.findOne(verifyLookupFilter(email, purpose));
    if (!doc) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: "Verification code expired or not found. Request a new code.",
      };
    }

    if (doc.expiresAt.getTime() < Date.now()) {
      await PharmacySignupVerification.deleteOne({ _id: doc._id });
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
        message: "Too many incorrect attempts. Request a new verification code.",
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

    await PharmacySignupVerification.deleteOne({ _id: doc._id });
    return { ok: true };
  },
};

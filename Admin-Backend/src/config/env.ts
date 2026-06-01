import dotenv from "dotenv";

dotenv.config();

/** Trim wrapping quotes/spaces common in `.env` / dotenvx. */
function stripEnvQuotes(v: string | undefined): string | undefined {
  if (v === undefined || v === null) return undefined;
  let s = v.trim();
  if (
    (s.startsWith('"') && s.endsWith('"') && s.length >= 2) ||
    (s.startsWith("'") && s.endsWith("'") && s.length >= 2)
  ) {
    s = s.slice(1, -1).trim();
  }
  return s === "" ? undefined : s;
}

const required = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"] as const;
for (const key of required) {
  if (!process.env[key] && process.env.NODE_ENV !== "test") {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/medcare_admin_test",
  appUrl: process.env.APP_URL ?? "http://localhost:5000",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "test-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "test-refresh-secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
  corsOrigins: (process.env.CORS_ORIGIN ?? "").split(",").map((v) => v.trim()).filter(Boolean),
  /** Customer.io transactional email — primary provider when API key is set. */
  customerio: {
    appApiKey: stripEnvQuotes(process.env.CUSTOMERIO_APP_API_KEY)?.trim(),
    region: (stripEnvQuotes(process.env.CUSTOMERIO_REGION) ?? "US").toUpperCase() as "US" | "EU",
    from: (
      stripEnvQuotes(process.env.CUSTOMERIO_FROM_EMAIL) ??
      stripEnvQuotes(process.env.RESEND_FROM) ??
      stripEnvQuotes(process.env.SMTP_FROM) ??
      "MED-CARE Ethiopia <noreply@medcare-et.com>"
    ).trim(),
  },
  /** Resend — fallback when Customer.io is not configured. */
  resend: {
    apiKey: stripEnvQuotes(process.env.RESEND_API_KEY)?.trim(),
    from: (
      stripEnvQuotes(process.env.RESEND_FROM) ??
      stripEnvQuotes(process.env.SMTP_FROM) ??
      "MED-CARE Ethiopia <onboarding@resend.dev>"
    ).trim(),
  },
  /** SMTP — last fallback. */
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? "MED-CARE Ethiopia <noreply@medcare-et.com>",
  },
};

import dotenv from "dotenv";

dotenv.config();

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
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? "MED-CARE Ethiopia <noreply@medcare-et.com>",
  },
};

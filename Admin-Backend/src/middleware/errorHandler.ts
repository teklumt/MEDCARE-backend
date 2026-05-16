import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { errorResponse } from "../utils/response.js";

export const notFoundHandler = (_req: Request, res: Response) =>
  errorResponse(res, "Route not found", "NOT_FOUND", 404);

const SENSITIVE_BODY_KEYS = new Set([
  "password",
  "passwordHash",
  "refreshToken",
  "token",
  "accessToken",
  "totpCode",
  "mfaCode",
]);

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;
  const out: Record<string, unknown> = { ...(body as Record<string, unknown>) };
  for (const key of SENSITIVE_BODY_KEYS) {
    if (key in out) out[key] = "[redacted]";
  }
  return out;
}

/** Structured fields for grep-friendly logs (Winston JSON + stack). */
function serializeError(err: unknown): Record<string, unknown> {
  if (!(err instanceof Error)) {
    return { kind: "non-error", value: String(err) };
  }
  const row: Record<string, unknown> = {
    name: err.name,
    message: err.message,
    stack: err.stack,
  };
  const anyErr = err as Error & {
    errors?: Record<string, { message?: string; path?: string }>;
    path?: string;
    kind?: string;
    value?: unknown;
  };
  if (anyErr.errors && typeof anyErr.errors === "object") {
    row.validationErrors = Object.fromEntries(
      Object.entries(anyErr.errors).map(([k, v]) => [k, v?.message ?? String(v)]),
    );
  }
  if (typeof anyErr.path === "string") row.path = anyErr.path;
  if (typeof anyErr.kind === "string") row.kind = anyErr.kind;
  if ("value" in anyErr) row.invalidValue = anyErr.value;
  return row;
}

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const serialized = serializeError(err);
  logger.error("Unhandled error", {
    requestId: req.headers["x-request-id"],
    method: req.method,
    path: req.originalUrl ?? req.url,
    routePath: req.route?.path,
    params: req.params,
    query: req.query,
    body: sanitizeBody(req.body),
    error: serialized,
  });
  return errorResponse(res, "Internal server error", "INTERNAL_ERROR", 500);
};

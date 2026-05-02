import { Response } from "express";

export const successResponse = <T>(res: Response, data: T, meta?: Record<string, unknown>, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data, ...(meta ? { meta } : {}) });

export const errorResponse = (
  res: Response,
  message: string,
  code: string,
  statusCode = 400,
  details?: unknown,
) => res.status(statusCode).json({ success: false, message, code, ...(details ? { details } : {}) });

import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/response.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return errorResponse(res, "Missing authorization token", "AUTH_REQUIRED", 401);
  }

  try {
    const decoded = verifyAccessToken(token);
    req.admin = {
      id: decoded.sub,
      role: decoded.role,
      mfaEnabled: decoded.mfa,
      permissions: decoded.permissions,
    };
    return next();
  } catch {
    return errorResponse(res, "Invalid or expired token", "AUTH_INVALID", 401);
  }
};

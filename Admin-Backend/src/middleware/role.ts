import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/response.js";
import type { UserRole } from "../types/auth.js";

export const requireRole = (...roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.admin) {
    return errorResponse(res, "Unauthorized", "AUTH_REQUIRED", 401);
  }
  if (!roles.includes(req.admin.role)) {
    return errorResponse(res, "Forbidden for this role", "FORBIDDEN", 403);
  }
  return next();
};

export const requirePermission = (...permissions: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return errorResponse(res, "Unauthorized", "AUTH_REQUIRED", 401);
    }

    if (req.admin.permissions.includes("*")) {
      return next();
    }

    const has = permissions.some((p) => req.admin!.permissions.includes(p));
    if (!has) {
      return errorResponse(res, "Insufficient permission", "FORBIDDEN", 403);
    }

    return next();
  };

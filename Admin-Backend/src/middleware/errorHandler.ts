import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { errorResponse } from "../utils/response.js";

export const notFoundHandler = (_req: Request, res: Response) =>
  errorResponse(res, "Route not found", "NOT_FOUND", 404);

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled error", { err });
  return errorResponse(res, "Internal server error", "INTERNAL_ERROR", 500);
};

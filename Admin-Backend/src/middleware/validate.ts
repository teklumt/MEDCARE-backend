import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { errorResponse } from "../utils/response.js";

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return errorResponse(res, "Validation failed", "VALIDATION_ERROR", 422, result.array());
  }
  return next();
};

import { NextFunction, Request, Response } from "express";

export const requireMFA = (req: Request, res: Response, next: NextFunction) => {
  // MFA enforcement is disabled for this project.
  void req;
  void res;
  return next();
};

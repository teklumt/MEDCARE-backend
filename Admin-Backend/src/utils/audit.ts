import { Request } from "express";
import { AuditLog } from "../models/AuditLog.js";

export const logAudit = async (
  req: Request,
  action: string,
  targetType: string,
  targetId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> => {
  await AuditLog.create({
    actorId: req.admin?.id,
    action,
    targetType,
    targetId,
    metadata,
  });
};

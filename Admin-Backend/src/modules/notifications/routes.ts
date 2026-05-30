import { Router } from "express";
import mongoose from "mongoose";
import { Notification } from "../../models/Notification.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);
notificationsRouter.use(requireRole("admin"));

notificationsRouter.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
    const limitRaw = parseInt(String(req.query.limit || "7"), 10) || 7;
    const limit = Math.min(50, Math.max(1, limitRaw));

    const recipientOid = new mongoose.Types.ObjectId(req.admin!.id);
    const filter = { recipientId: recipientOid };

    const items = await Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit + 1).lean();

    const [unreadCount, totalCount] = await Promise.all([
      Notification.countDocuments({ ...filter, readAt: null }),
      Notification.countDocuments(filter),
    ]);

    const hasMore = items.length > limit;
    const notifications = hasMore ? items.slice(0, limit) : items;

    return successResponse(res, {
      notifications,
      unreadCount,
      page,
      limit,
      hasMore,
      total: totalCount,
    });
  } catch (e) {
    return errorResponse(res, "Failed to fetch notifications", "NOTIFICATION_LIST_ERROR", 500, (e as Error).message);
  }
});

notificationsRouter.patch("/read", async (req, res) => {
  try {
    const recipientOid = new mongoose.Types.ObjectId(req.admin!.id);
    const body = req.body as { ids?: unknown; all?: unknown };
    const now = new Date();

    if (body.all === true) {
      await Notification.updateMany({ recipientId: recipientOid, readAt: null }, { $set: { readAt: now } }).exec();
      return successResponse(res, { updated: true });
    }

    const idsRaw = body.ids;
    if (!Array.isArray(idsRaw) || idsRaw.length === 0) {
      return errorResponse(res, "Provide ids (string[]) or all: true", "VALIDATION", 400);
    }

    const objectIds = idsRaw
      .filter((x): x is string => typeof x === "string" && mongoose.Types.ObjectId.isValid(x))
      .map((s) => new mongoose.Types.ObjectId(s));

    if (!objectIds.length) {
      return errorResponse(res, "No valid ids", "VALIDATION", 400);
    }

    await Notification.updateMany(
      { recipientId: recipientOid, _id: { $in: objectIds }, readAt: null },
      { $set: { readAt: now } },
    ).exec();

    return successResponse(res, { updated: true });
  } catch (e) {
    return errorResponse(res, "Failed to update notifications", "NOTIFICATION_READ_ERROR", 500, (e as Error).message);
  }
});

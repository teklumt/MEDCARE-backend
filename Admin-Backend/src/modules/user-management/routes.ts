import { Router } from "express";
import { body, query } from "express-validator";
import { EndUser } from "../../models/EndUser.js";
import { Order } from "../../models/Order.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { requireMFA } from "../../middleware/mfa.js";
import { validateRequest } from "../../middleware/validate.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { getPagination } from "../../utils/pagination.js";
import { logAudit } from "../../utils/audit.js";

export const userManagementRouter = Router();
userManagementRouter.use(requireAuth);

userManagementRouter.get(
  "/",
  requireRole("super_admin", "admin", "moderator"),
  query("search").optional().isString(),
  validateRequest,
  async (req, res) => {
    const { search, isBanned, region, page, limit } = req.query as Record<string, string>;
    const { skip, page: p, limit: l } = getPagination({ page: Number(page), limit: Number(limit) });

    const filter: Record<string, unknown> = {};
    if (typeof isBanned !== "undefined") filter["ban.isBanned"] = isBanned === "true";
    if (region) filter.region = region;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      EndUser.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
      EndUser.countDocuments(filter),
    ]);

    return successResponse(res, items, { page: p, limit: l, total });
  },
);

userManagementRouter.get("/banned", requireRole("super_admin", "admin", "moderator"), async (req, res) => {
  const { region, type } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = { "ban.isBanned": true };
  if (region) filter.region = region;
  if (type) filter["ban.type"] = type;

  const users = await EndUser.find(filter).sort({ updatedAt: -1 }).lean();
  return successResponse(res, users);
});

userManagementRouter.get("/:id", requireRole("super_admin", "admin", "moderator"), async (req, res) => {
  const user = await EndUser.findById(req.params.id).lean();
  if (!user) return errorResponse(res, "User not found", "NOT_FOUND", 404);

  const orders = await Order.find({ patientId: user._id }).sort({ createdAt: -1 }).limit(100).lean();
  return successResponse(res, { ...user, orderHistory: orders, reports: user.reportedCount, flags: user.flags });
});

userManagementRouter.patch(
  "/:id/ban",
  requireRole("super_admin", "admin"),
  requireMFA,
  body("type").isIn(["temporary", "permanent"]),
  body("reason").isString().isLength({ min: 3 }),
  body("expiresAt").optional().isISO8601(),
  validateRequest,
  async (req, res) => {
    const { type, reason, expiresAt } = req.body as { type: "temporary" | "permanent"; reason: string; expiresAt?: string };
    const user = await EndUser.findById(req.params.id);
    if (!user) return errorResponse(res, "User not found", "NOT_FOUND", 404);

    user.status = "banned";
    user.ban = {
      ...(user.ban ?? { isBanned: false }),
      isBanned: true,
      type,
      reason,
      bannedBy: req.admin!.id as any,
      expiresAt: type === "temporary" && expiresAt ? new Date(expiresAt) : undefined,
    };
    await user.save();

    await logAudit(req, "user.ban", "EndUser", String(user._id), { type, reason });
    return successResponse(res, { id: user._id, isBanned: true, type });
  },
);

userManagementRouter.patch("/:id/unban", requireRole("super_admin", "admin"), async (req, res) => {
  const user = await EndUser.findById(req.params.id);
  if (!user) return errorResponse(res, "User not found", "NOT_FOUND", 404);

  user.status = "active";
  user.ban = { isBanned: false } as any;
  await user.save();

  await logAudit(req, "user.unban", "EndUser", String(user._id));
  return successResponse(res, { id: user._id, isBanned: false });
});

userManagementRouter.patch(
  "/:id/warn",
  requireRole("super_admin", "admin", "moderator"),
  body("reason").optional().isString(),
  validateRequest,
  async (req, res) => {
    const { reason } = req.body as { reason?: string };
    const user = await EndUser.findById(req.params.id);
    if (!user) return errorResponse(res, "User not found", "NOT_FOUND", 404);

    user.warningCount += 1;
    user.flags = user.flags ?? [];
    if (reason) {
      user.flags.push({ reason: `warning:${reason}`, flaggedBy: req.admin!.id as any, flaggedAt: new Date() } as any);
    }

    if (user.warningCount >= 3 && !user.ban?.isBanned) {
      user.status = "banned";
      user.ban = {
        isBanned: true,
        type: "temporary",
        reason: "Auto-ban after 3 warnings",
        bannedBy: req.admin!.id as any,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      } as any;
    }

    await user.save();
    await logAudit(req, "user.warn", "EndUser", String(user._id), { warningCount: user.warningCount });

    return successResponse(res, { id: user._id, warningCount: user.warningCount, autoBanned: user.ban?.isBanned });
  },
);

userManagementRouter.post(
  "/:id/flag",
  requireRole("super_admin", "admin", "moderator"),
  body("reason").isString().isLength({ min: 2 }),
  validateRequest,
  async (req, res) => {
    const { reason } = req.body as { reason: string };
    const user = await EndUser.findById(req.params.id);
    if (!user) return errorResponse(res, "User not found", "NOT_FOUND", 404);

    user.flags = user.flags ?? [];
    user.flags.push({ reason, flaggedBy: req.admin!.id as any, flaggedAt: new Date() } as any);
    await user.save();

    await logAudit(req, "user.flag", "EndUser", String(user._id), { reason });
    return successResponse(res, { id: user._id, flags: user.flags.length });
  },
);


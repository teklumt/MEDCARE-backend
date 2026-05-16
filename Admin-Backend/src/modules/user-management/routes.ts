import { Router } from "express";
import { body, query } from "express-validator";
import { User } from "../../models/User.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { validateRequest } from "../../middleware/validate.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { getPagination } from "../../utils/pagination.js";
import { logAudit } from "../../utils/audit.js";

export const userManagementRouter = Router();
userManagementRouter.use(requireAuth);

userManagementRouter.get(
  "/",
  requireRole("admin"),
  query("role").optional().isIn(["patient", "pharmacy", "delivery", "admin"]),
  query("search").optional().isString(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  validateRequest,
  async (req, res) => {
    const { role, search, page, limit } = req.query as Record<string, string>;
    const { skip, page: p, limit: l } = getPagination({ page: Number(page), limit: Number(limit) });

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
      User.countDocuments(filter),
    ]);

    return successResponse(res, items, { page: p, limit: l, total });
  },
);

userManagementRouter.patch(
  "/:id",
  requireRole("admin"),
  body("isActive").optional().isBoolean(),
  body("role").optional().isIn(["patient", "pharmacy", "delivery", "admin"]),
  validateRequest,
  (req, res, next) => {
    const { isActive, role } = req.body as { isActive?: boolean; role?: string };
    const hasActive = typeof isActive === "boolean";
    const hasRole = typeof role === "string";
    if (!hasActive && !hasRole) {
      return errorResponse(res, "Provide at least one of isActive or role", "VALIDATION_ERROR", 400);
    }
    return next();
  },
  async (req, res) => {
    const { isActive, role } = req.body as {
      isActive?: boolean;
      role?: "patient" | "pharmacy" | "delivery" | "admin";
    };
    const $set: Record<string, unknown> = {};
    if (typeof isActive === "boolean") $set.isActive = isActive;
    if (typeof role === "string") $set.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, { $set }, { new: true }).lean();
    if (!user) return errorResponse(res, "User not found", "NOT_FOUND", 404);

    const auditPayload: Record<string, unknown> = {};
    if (typeof isActive === "boolean") auditPayload.isActive = isActive;
    if (typeof role === "string") auditPayload.role = role;

    await logAudit(req, "admin.user.update", "User", String(user._id), auditPayload);
    return successResponse(res, {
      id: user._id,
      isActive: user.isActive,
      role: user.role,
    });
  },
);

userManagementRouter.delete("/:id", requireRole("admin"), async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id).lean();
  if (!user) return errorResponse(res, "User not found", "NOT_FOUND", 404);

  await logAudit(req, "admin.user.delete", "User", String(user._id));
  return successResponse(res, { id: user._id, deleted: true });
});

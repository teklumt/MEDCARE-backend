import { Router } from "express";
import { body, query } from "express-validator";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { requireMFA } from "../../middleware/mfa.js";
import { validateRequest } from "../../middleware/validate.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { getPagination } from "../../utils/pagination.js";
import { logAudit } from "../../utils/audit.js";
import { adminService } from "../../services/admin.service.js";

export const adminManagementRouter = Router();

adminManagementRouter.post(
  "/create",
  requireAuth,
  requireRole("super_admin"),
  body("fullName").isString().isLength({ min: 2 }),
  body("email").isEmail(),
  body("password").isString().isLength({ min: 8 }),
  body("role").isIn(["admin", "moderator"]),
  validateRequest,
  async (req, res) => {
    const { fullName, email, password, role, permissions } = req.body as {
      fullName: string;
      email: string;
      password: string;
      role: "admin" | "moderator";
      permissions?: string[];
    };

    const result = await adminService.createAdmin({ fullName, email, password, role, permissions, createdBy: req.admin?.id });
    if (result.error) {
      return errorResponse(res, result.error.message, result.error.code, result.error.status);
    }

    const admin = result.data!;

    await logAudit(req, "admin.create", "Admin", String(admin._id), { role });
    return successResponse(res, { id: admin._id, email: admin.email, role: admin.role }, undefined, 201);
  },
);

adminManagementRouter.get(
  "/",
  requireAuth,
  requireRole("super_admin"),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("role").optional().isIn(["super_admin", "admin", "moderator"]),
  validateRequest,
  async (req, res) => {
    const { page, limit, role } = req.query as { page?: string; limit?: string; role?: string };
    const { skip, page: p, limit: l } = getPagination({ page: Number(page), limit: Number(limit) });

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;

    const { items, total } = await adminService.listAdmins(filter, skip, l);

    return successResponse(res, items, { page: p, limit: l, total });
  },
);

adminManagementRouter.patch(
  "/:id/role",
  requireAuth,
  requireRole("super_admin"),
  body("role").isIn(["super_admin", "admin", "moderator"]),
  validateRequest,
  async (req, res) => {
    const id = String(req.params.id);
    const { role } = req.body as { role: "super_admin" | "admin" | "moderator" };

    const result = await adminService.updateRole(id, role);
    if (result.error) {
      return errorResponse(res, result.error.message, result.error.code, result.error.status);
    }

    const admin = result.data!;

    await logAudit(req, "admin.role.update", "Admin", String(admin._id), { role });
    return successResponse(res, { id: admin._id, role: admin.role });
  },
);

adminManagementRouter.patch(
  "/:id/suspend",
  requireAuth,
  requireRole("super_admin"),
  requireMFA,
  body("reason").isString().isLength({ min: 3 }),
  validateRequest,
  async (req, res) => {
    const id = String(req.params.id);
    const { reason } = req.body as { reason: string };

    const result = await adminService.suspend(id, reason);
    if (result.error) {
      return errorResponse(res, result.error.message, result.error.code, result.error.status);
    }

    const admin = result.data!;

    await logAudit(req, "admin.suspend", "Admin", String(admin._id), { reason });
    return successResponse(res, { id: admin._id, status: admin.status, reason });
  },
);

adminManagementRouter.delete("/:id", requireAuth, requireRole("super_admin"), requireMFA, async (req, res) => {
  const id = String(req.params.id);
  const result = await adminService.softDelete(id);
  if (result.error) {
    return errorResponse(res, result.error.message, result.error.code, result.error.status);
  }

  const admin = result.data!;

  await logAudit(req, "admin.delete.soft", "Admin", String(admin._id));
  return successResponse(res, { id: admin._id, deleted: true });
});

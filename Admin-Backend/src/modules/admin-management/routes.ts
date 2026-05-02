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
  requireRole("admin"),
  body("username").optional().isString().isLength({ min: 2 }),
  body("fullName").optional().isString().isLength({ min: 2 }),
  body("email").isEmail(),
  body("phone").isString().isLength({ min: 6 }),
  body("password").isString().isLength({ min: 8 }),
  validateRequest,
  async (req, res) => {
    const { username, fullName, email, phone, password, permissions } = req.body as {
      username?: string;
      fullName?: string;
      email: string;
      phone: string;
      password: string;
      permissions?: string[];
    };

    const resolvedUsername = username ?? fullName ?? email.split("@")[0];
    const result = await adminService.createAdmin({
      username: resolvedUsername,
      email,
      phone,
      password,
      permissions,
      createdBy: req.admin?.id,
    });
    if (result.error) {
      return errorResponse(res, result.error.message, result.error.code, result.error.status);
    }

    const admin = result.data!;

    await logAudit(req, "admin.create", "User", String(admin._id), { role: admin.role });
    return successResponse(res, { id: admin._id, email: admin.email, role: admin.role }, undefined, 201);
  },
);

adminManagementRouter.get(
  "/",
  requireAuth,
  requireRole("admin"),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("role").optional().isIn(["admin"]),
  validateRequest,
  async (req, res) => {
    const { page, limit, role } = req.query as { page?: string; limit?: string; role?: string };
    const { skip, page: p, limit: l } = getPagination({ page: Number(page), limit: Number(limit) });

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (!role) filter.role = "admin";

    const { items, total } = await adminService.listAdmins(filter, skip, l);

    return successResponse(res, items, { page: p, limit: l, total });
  },
);

adminManagementRouter.patch(
  "/:id/role",
  requireAuth,
  requireRole("admin"),
  body("role").isIn(["admin"]),
  validateRequest,
  async (req, res) => {
    const id = String(req.params.id);
    const { role } = req.body as { role: "admin" };

    const result = await adminService.updateRole(id, role);
    if (result.error) {
      return errorResponse(res, result.error.message, result.error.code, result.error.status);
    }

    const admin = result.data!;

    await logAudit(req, "admin.role.update", "User", String(admin._id), { role });
    return successResponse(res, { id: admin._id, role: admin.role });
  },
);

adminManagementRouter.patch(
  "/:id/suspend",
  requireAuth,
  requireRole("admin"),
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

    await logAudit(req, "admin.suspend", "User", String(admin._id), { reason });
    return successResponse(res, { id: admin._id, isActive: admin.isActive, reason });
  },
);

adminManagementRouter.delete("/:id", requireAuth, requireRole("admin"), requireMFA, async (req, res) => {
  const id = String(req.params.id);
  const result = await adminService.softDelete(id);
  if (result.error) {
    return errorResponse(res, result.error.message, result.error.code, result.error.status);
  }

  const admin = result.data!;

  await logAudit(req, "admin.delete.soft", "User", String(admin._id));
  return successResponse(res, { id: admin._id, deleted: true });
});

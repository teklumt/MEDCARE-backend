import { Router } from "express";
import { body, query } from "express-validator";
import { Pharmacy } from "../../models/Pharmacy.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { requireMFA } from "../../middleware/mfa.js";
import { validateRequest } from "../../middleware/validate.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { getPagination } from "../../utils/pagination.js";
import { sendMail } from "../../utils/mailer.js";
import { logAudit } from "../../utils/audit.js";

export const licenseVerificationRouter = Router();
licenseVerificationRouter.use(requireAuth);

licenseVerificationRouter.get(
  "/",
  requireRole("super_admin", "admin"),
  query("status").optional().isIn(["pending", "verified", "rejected", "expired", "revoked"]),
  validateRequest,
  async (req, res) => {
    const { status, region, startDate, endDate, page, limit } = req.query as Record<string, string>;
    const { skip, page: p, limit: l } = getPagination({ page: Number(page), limit: Number(limit) });

    const filter: Record<string, unknown> = {};
    if (status) filter["license.status"] = status;
    if (region) filter["address.region"] = region;
    if (startDate || endDate) {
      filter.createdAt = {
        ...(startDate ? { $gte: new Date(startDate) } : {}),
        ...(endDate ? { $lte: new Date(endDate) } : {}),
      };
    }

    const [items, total] = await Promise.all([
      Pharmacy.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
      Pharmacy.countDocuments(filter),
    ]);

    return successResponse(res, items, { page: p, limit: l, total });
  },
);

licenseVerificationRouter.get("/expiring", requireRole("super_admin", "admin", "moderator"), async (_req, res) => {
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const items = await Pharmacy.find({
    "license.status": "verified",
    "license.expiryDate": { $lte: in30Days, $gte: new Date() },
  })
    .sort({ "license.expiryDate": 1 })
    .lean();

  return successResponse(res, items);
});

licenseVerificationRouter.get("/:id", requireRole("super_admin", "admin", "moderator"), async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id).lean();
  if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);
  return successResponse(res, { pharmacyId: pharmacy._id, businessName: pharmacy.businessName, license: pharmacy.license });
});

licenseVerificationRouter.patch("/:id/approve", requireRole("super_admin", "admin"), async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);
  if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

  pharmacy.license = {
    ...(pharmacy.license ?? {}),
    status: "verified",
    reviewedBy: req.admin!.id as any,
    reviewedAt: new Date(),
    rejectionReason: undefined,
    verificationHistory: [
      ...(pharmacy.license?.verificationHistory ?? []),
      { adminId: req.admin!.id as any, action: "approved", timestamp: new Date() } as any,
    ],
  } as any;
  pharmacy.isVerifiedBadge = true;
  await pharmacy.save();

  if (pharmacy?.email) {
    await sendMail(pharmacy.email, "License Approved", "<p>Your pharmacy license has been approved.</p>");
  }

  await logAudit(req, "license.approve", "Pharmacy", String(pharmacy._id));
  return successResponse(res, { id: pharmacy._id, status: pharmacy.license?.status });
});

licenseVerificationRouter.patch(
  "/:id/reject",
  requireRole("super_admin", "admin"),
  body("reason").isString().isLength({ min: 3 }),
  validateRequest,
  async (req, res) => {
    const { reason } = req.body as { reason: string };
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

    pharmacy.license = {
      ...(pharmacy.license ?? {}),
      status: "rejected",
      reviewedBy: req.admin!.id as any,
      reviewedAt: new Date(),
      rejectionReason: reason,
      verificationHistory: [
        ...(pharmacy.license?.verificationHistory ?? []),
        { adminId: req.admin!.id as any, action: "rejected", note: reason, timestamp: new Date() } as any,
      ],
    } as any;
    pharmacy.isVerifiedBadge = false;
    await pharmacy.save();

    if (pharmacy?.email) {
      await sendMail(pharmacy.email, "License Rejected", `<p>Your pharmacy license was rejected: ${reason}</p>`);
    }

    await logAudit(req, "license.reject", "Pharmacy", String(pharmacy._id), { reason });
    return successResponse(res, { id: pharmacy._id, status: pharmacy.license?.status });
  },
);

licenseVerificationRouter.patch(
  "/:id/revoke",
  requireRole("super_admin", "admin"),
  requireMFA,
  body("reason").isString().isLength({ min: 3 }),
  validateRequest,
  async (req, res) => {
    const { reason } = req.body as { reason: string };
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

    pharmacy.license = {
      ...(pharmacy.license ?? {}),
      status: "revoked",
      reviewedBy: req.admin!.id as any,
      reviewedAt: new Date(),
      rejectionReason: reason,
      verificationHistory: [
        ...(pharmacy.license?.verificationHistory ?? []),
        { adminId: req.admin!.id as any, action: "revoked", note: reason, timestamp: new Date() } as any,
      ],
    } as any;
    pharmacy.isVerifiedBadge = false;
    pharmacy.status = "suspended";
    await pharmacy.save();

    await logAudit(req, "license.revoke", "Pharmacy", String(pharmacy._id), { reason });
    return successResponse(res, { id: pharmacy._id, status: pharmacy.license?.status });
  },
);

licenseVerificationRouter.post(
  "/:id/note",
  requireRole("super_admin", "admin", "moderator"),
  body("note").isString().isLength({ min: 2 }),
  validateRequest,
  async (req, res) => {
    const { note } = req.body as { note: string };
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

    pharmacy.license = {
      ...(pharmacy.license ?? {}),
      notes: [...(pharmacy.license?.notes ?? []), note],
      verificationHistory: [
        ...(pharmacy.license?.verificationHistory ?? []),
        { adminId: req.admin!.id as any, action: "note", note, timestamp: new Date() } as any,
      ],
    } as any;
    await pharmacy.save();

    await logAudit(req, "license.note", "Pharmacy", String(pharmacy._id), { note });
    return successResponse(res, { id: pharmacy._id, notes: pharmacy.license?.notes ?? [] });
  },
);

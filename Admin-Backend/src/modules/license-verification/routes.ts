import { Router } from "express";
import { body, query } from "express-validator";
import { Pharmacy } from "../../models/Pharmacy.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { requireMFA } from "../../middleware/mfa.js";
import { validateRequest } from "../../middleware/validate.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { getPagination } from "../../utils/pagination.js";
import { sendMail, buildEmailHtml } from "../../utils/mailer.js";
import { logAudit } from "../../utils/audit.js";
import { logger } from "../../utils/logger.js";

/** Mongoose subdocument spread omits nested paths; `documents` must not be undefined for nested schema. */
function plainVerificationFrom(verification: unknown): Record<string, unknown> {
  if (verification == null) {
    return { documents: {} };
  }
  const sub = verification as { toObject?: () => Record<string, unknown> };
  const plain =
    typeof sub.toObject === "function"
      ? sub.toObject()
      : { ...(verification as Record<string, unknown>) };
  const documents = plain.documents != null ? plain.documents : {};
  return { ...plain, documents };
}

export const licenseVerificationRouter = Router();
licenseVerificationRouter.use(requireAuth);

licenseVerificationRouter.get(
  "/",
  requireRole("admin"),
  query("status").optional().isIn(["pending", "reviewing", "approved", "rejected", "needs_docs"]),
  validateRequest,
  async (req, res) => {
    const { status, region, startDate, endDate, page, limit } = req.query as Record<string, string>;
    const { skip, page: p, limit: l } = getPagination({ page: Number(page), limit: Number(limit) });

    const filter: Record<string, unknown> = {};
    if (status) filter["verification.status"] = status;
    if (region) {
      filter.$or = [
        { location: { $regex: region, $options: "i" } },
        { address: { $regex: region, $options: "i" } },
      ];
    }
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

licenseVerificationRouter.get("/expiring", requireRole("admin"), async (_req, res) => {
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const items = await Pharmacy.find({
    "verification.status": "approved",
    $or: [
      { "license.businessLicenseExpiry": { $lte: in30Days, $gte: new Date() } },
      { "license.professionalLicenseExpiry": { $lte: in30Days, $gte: new Date() } },
    ],
  })
    .sort({ "license.businessLicenseExpiry": 1 })
    .lean();

  return successResponse(res, items);
});

licenseVerificationRouter.get("/:id", requireRole("admin"), async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id).populate("ownerId", "username").lean();
  if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

  const ownerRef = pharmacy.ownerId as unknown;
  let ownerIdStr: string;
  let ownerName: string | null = null;
  if (ownerRef && typeof ownerRef === "object" && "_id" in ownerRef) {
    ownerIdStr = String((ownerRef as { _id: unknown })._id);
    ownerName =
      "username" in ownerRef && typeof (ownerRef as { username?: string }).username === "string"
        ? (ownerRef as { username: string }).username
        : null;
  } else {
    ownerIdStr = String(pharmacy.ownerId ?? "");
  }

  return successResponse(res, {
    pharmacyId: pharmacy._id,
    businessName: pharmacy.businessName,
    location: pharmacy.location || pharmacy.address,
    email: pharmacy.email,
    phone: pharmacy.phone,
    ownerId: ownerIdStr,
    ownerName,
    license: pharmacy.license,
    verification: pharmacy.verification,
  });
});

licenseVerificationRouter.patch("/:id/approve", requireRole("admin"), async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);
  if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

  pharmacy.verification = {
    ...plainVerificationFrom(pharmacy.verification),
    status: "approved",
    verifiedById: req.admin!.id as any,
    verifiedAt: new Date(),
    rejectionNote: null,
  } as any;
  pharmacy.isActive = true;
  await pharmacy.save();

  if (pharmacy?.email) {
    await sendMail(pharmacy.email, "License Approved", "<p>Your pharmacy license has been approved.</p>");
  }

  await logAudit(req, "license.approve", "Pharmacy", String(pharmacy._id));
  return successResponse(res, { id: pharmacy._id, status: pharmacy.verification?.status });
});

licenseVerificationRouter.patch(
  "/:id/reject",
  requireRole("admin"),
  body("reason").isString().isLength({ min: 3 }),
  validateRequest,
  async (req, res) => {
    const { reason } = req.body as { reason: string };
    logger.info("[license.reject] request", {
      pharmacyId: req.params.id,
      actorId: req.admin?.id,
      reasonLength: reason.length,
    });

    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

    pharmacy.verification = {
      ...plainVerificationFrom(pharmacy.verification),
      status: "rejected",
      verifiedById: req.admin!.id as any,
      verifiedAt: new Date(),
      rejectionNote: reason,
    } as any;
    await pharmacy.save();

    if (pharmacy?.email) {
      await sendMail(pharmacy.email, "License Rejected", `<p>Your pharmacy license was rejected: ${reason}</p>`);
    }

    await logAudit(req, "license.reject", "Pharmacy", String(pharmacy._id), { reason });
    logger.info("[license.reject] ok", { pharmacyId: String(pharmacy._id) });
    return successResponse(res, { id: pharmacy._id, status: pharmacy.verification?.status });
  },
);

licenseVerificationRouter.patch(
  "/:id/revoke",
  requireRole("admin"),
  requireMFA,
  body("reason").isString().isLength({ min: 3 }),
  validateRequest,
  async (req, res) => {
    const { reason } = req.body as { reason: string };
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

    pharmacy.verification = {
      ...plainVerificationFrom(pharmacy.verification),
      status: "rejected",
      verifiedById: req.admin!.id as any,
      verifiedAt: new Date(),
      rejectionNote: reason,
    } as any;
    pharmacy.isActive = false;
    await pharmacy.save();

    await logAudit(req, "license.revoke", "Pharmacy", String(pharmacy._id), { reason });
    return successResponse(res, { id: pharmacy._id, status: pharmacy.verification?.status });
  },
);

licenseVerificationRouter.post(
  "/:id/note",
  requireRole("admin"),
  body("note").isString().isLength({ min: 2 }),
  validateRequest,
  async (req, res) => {
    const { note } = req.body as { note: string };
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

    pharmacy.verification = {
      ...plainVerificationFrom(pharmacy.verification),
      status: "needs_docs",
      rejectionNote: note,
    } as any;
    await pharmacy.save();

    await logAudit(req, "license.note", "Pharmacy", String(pharmacy._id), { note });
    return successResponse(res, { id: pharmacy._id, note });
  },
);

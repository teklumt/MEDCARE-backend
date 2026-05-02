import { Router } from "express";
import { body } from "express-validator";
import { Pharmacy } from "../../models/Pharmacy.js";
import { Order } from "../../models/Order.js";
import { Review } from "../../models/Review.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { requireMFA } from "../../middleware/mfa.js";
import { validateRequest } from "../../middleware/validate.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { sendMail } from "../../utils/mailer.js";
import { logAudit } from "../../utils/audit.js";

export const pharmacyManagementRouter = Router();
pharmacyManagementRouter.use(requireAuth);

pharmacyManagementRouter.get("/", requireRole("super_admin", "admin", "moderator"), async (req, res) => {
  const { status, region, rating, license } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};

  if (status) filter.status = status;
  if (region) filter["address.region"] = region;
  if (rating) filter.rating = { $gte: Number(rating) };
  if (license) filter["license.status"] = license;

  const pharmacies = await Pharmacy.find(filter).sort({ createdAt: -1 }).lean();
  return successResponse(res, pharmacies);
});

pharmacyManagementRouter.get("/unverified", requireRole("super_admin", "admin", "moderator"), async (_req, res) => {
  const items = await Pharmacy.find({ "license.status": { $ne: "verified" } }).lean();
  return successResponse(res, items);
});

pharmacyManagementRouter.get("/:id", requireRole("super_admin", "admin", "moderator"), async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id).lean();
  if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

  const [inventorySummary, orders, reviews] = await Promise.all([
    Promise.resolve({ items: 0, lowStock: 0 }),
    Order.find({ pharmacyId: pharmacy._id }).limit(50).lean(),
    Review.find({ pharmacyId: pharmacy._id }).limit(50).lean(),
  ]);

  return successResponse(res, { ...pharmacy, inventorySummary, orders, reviews });
});

pharmacyManagementRouter.patch(
  "/:id/suspend",
  requireRole("super_admin", "admin"),
  requireMFA,
  body("reason").isString().isLength({ min: 3 }),
  validateRequest,
  async (req, res) => {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

    const { reason } = req.body as { reason: string };
    pharmacy.status = "suspended";
    pharmacy.suspendedReason = reason;
    pharmacy.suspendedBy = req.admin!.id as any;
    await pharmacy.save();

    await sendMail(pharmacy.email, "Pharmacy Suspended", `<p>Your pharmacy has been suspended: ${reason}</p>`);
    await logAudit(req, "pharmacy.suspend", "Pharmacy", String(pharmacy._id), { reason });

    return successResponse(res, { id: pharmacy._id, status: pharmacy.status });
  },
);

pharmacyManagementRouter.patch("/:id/activate", requireRole("super_admin", "admin"), async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);
  if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

  pharmacy.status = "active";
  pharmacy.suspendedReason = undefined;
  await pharmacy.save();

  await logAudit(req, "pharmacy.activate", "Pharmacy", String(pharmacy._id));
  return successResponse(res, { id: pharmacy._id, status: pharmacy.status });
});

pharmacyManagementRouter.delete("/:id", requireRole("super_admin", "admin"), requireMFA, async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);
  if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

  pharmacy.status = "deactivated";
  await pharmacy.save();

  await logAudit(req, "pharmacy.delete.soft", "Pharmacy", String(pharmacy._id));
  return successResponse(res, { id: pharmacy._id, deleted: true });
});

pharmacyManagementRouter.get("/:id/orders", requireRole("super_admin", "admin", "moderator"), async (req, res) => {
  const orders = await Order.find({ pharmacyId: req.params.id }).sort({ createdAt: -1 }).lean();
  return successResponse(res, orders);
});

pharmacyManagementRouter.get("/:id/reviews", requireRole("super_admin", "admin", "moderator"), async (req, res) => {
  const reviews = await Review.find({ pharmacyId: req.params.id }).sort({ createdAt: -1 }).lean();
  return successResponse(res, reviews, { canFlag: true });
});

pharmacyManagementRouter.patch(
  "/:id/badge",
  requireRole("super_admin", "admin"),
  body("enabled").isBoolean(),
  validateRequest,
  async (req, res) => {
    const { enabled } = req.body as { enabled: boolean };
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      { $set: { isVerifiedBadge: enabled } },
      { new: true },
    ).lean();

    if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);
    await logAudit(req, "pharmacy.badge", "Pharmacy", String(pharmacy._id), { enabled });

    return successResponse(res, { id: pharmacy._id, isVerifiedBadge: pharmacy.isVerifiedBadge });
  },
);

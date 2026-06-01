import { Router } from "express";
import mongoose from "mongoose";
import { body } from "express-validator";
import { Pharmacy } from "../../models/Pharmacy.js";
import { Order } from "../../models/Order.js";
import { Review } from "../../models/Review.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { requireMFA } from "../../middleware/mfa.js";
import { validateRequest } from "../../middleware/validate.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { sendMail, buildEmailHtml } from "../../utils/mailer.js";
import { logAudit } from "../../utils/audit.js";
import { CommissionAccrualModel, CommissionPaymentModel } from "../../models/CommissionLedger.js";

export const pharmacyManagementRouter = Router();
pharmacyManagementRouter.use(requireAuth);

pharmacyManagementRouter.get("/", requireRole("admin"), async (req, res) => {
  const { status, region, rating, license } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};

  if (status) filter.isActive = status === "active";
  if (region) {
    filter.$or = [
      { location: { $regex: region, $options: "i" } },
      { address: { $regex: region, $options: "i" } },
    ];
  }
  if (rating) filter["stats.rating"] = { $gte: Number(rating) };
  if (license) filter["verification.status"] = license;

  const pharmacies = await Pharmacy.find(filter).sort({ createdAt: -1 }).lean();

  if (pharmacies.length === 0) return successResponse(res, pharmacies);

  const ids = pharmacies.map((p) => p._id);
  type IdAggRow = { _id: mongoose.Types.ObjectId; total: number };

  const [accRows, payRows] = await Promise.all([
    CommissionAccrualModel.aggregate<IdAggRow>([
      { $match: { pharmacyId: { $in: ids } } },
      { $group: { _id: "$pharmacyId", total: { $sum: "$amountEtb" } } },
    ]),
    CommissionPaymentModel.aggregate<IdAggRow>([
      { $match: { pharmacyId: { $in: ids }, status: "success" } },
      { $group: { _id: "$pharmacyId", total: { $sum: "$amount" } } },
    ]),
  ]);

  const accMap = new Map(accRows.map((r) => [String(r._id), r.total]));
  const payMap = new Map(payRows.map((r) => [String(r._id), r.total]));

  const enriched = pharmacies.map((p) => {
    const id = String(p._id);
    const accrued = accMap.get(id) ?? 0;
    const paid = payMap.get(id) ?? 0;
    const commissionDebtEtb = Math.max(0, accrued - paid);
    return { ...p, commissionDebtEtb };
  });

  return successResponse(res, enriched);
});

pharmacyManagementRouter.get("/unverified", requireRole("admin"), async (_req, res) => {
  const items = await Pharmacy.find({ "verification.status": { $ne: "approved" } }).lean();
  return successResponse(res, items);
});

pharmacyManagementRouter.get("/:id", requireRole("admin"), async (req, res) => {
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
  requireRole("admin"),
  requireMFA,
  body("reason").isString().isLength({ min: 3 }),
  validateRequest,
  async (req, res) => {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

    const { reason } = req.body as { reason: string };
    pharmacy.isActive = false;
    await pharmacy.save();

    await sendMail(pharmacy.email, "Your pharmacy account has been suspended", buildEmailHtml({
      title: "Pharmacy Suspended",
      preheader: "Important notice about your MED-CARE pharmacy account.",
      body: `
        <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Your pharmacy has been suspended</h2>
        <p style="margin:0 0 20px;color:#6b7280;font-size:15px;">
          Your pharmacy account on MED-CARE Ethiopia has been <strong style="color:#dc2626;">suspended</strong> by the admin team.
          Your pharmacy is no longer visible to patients and cannot accept orders.
        </p>
        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px 20px;border-radius:6px;margin-bottom:20px;">
          <p style="margin:0 0 4px;color:#991b1b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Reason for suspension</p>
          <p style="margin:0;color:#7f1d1d;font-size:14px;">${reason}</p>
        </div>
        <p style="margin:0;color:#6b7280;font-size:13px;">
          If you believe this is a mistake or wish to appeal, please contact the MED-CARE support team.
        </p>
      `,
    }));
    await logAudit(req, "pharmacy.suspend", "Pharmacy", String(pharmacy._id), { reason });

    return successResponse(res, { id: pharmacy._id, isActive: pharmacy.isActive });
  },
);

pharmacyManagementRouter.patch("/:id/activate", requireRole("admin"), async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);
  if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

  pharmacy.isActive = true;
  await pharmacy.save();

  await logAudit(req, "pharmacy.activate", "Pharmacy", String(pharmacy._id));
  return successResponse(res, { id: pharmacy._id, isActive: pharmacy.isActive });
});

pharmacyManagementRouter.delete("/:id", requireRole("admin"), requireMFA, async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);
  if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);

  pharmacy.isActive = false;
  await pharmacy.save();

  await logAudit(req, "pharmacy.delete.soft", "Pharmacy", String(pharmacy._id));
  return successResponse(res, { id: pharmacy._id, deleted: true });
});

pharmacyManagementRouter.get("/:id/orders", requireRole("admin"), async (req, res) => {
  const orders = await Order.find({ pharmacyId: req.params.id }).sort({ createdAt: -1 }).lean();
  return successResponse(res, orders);
});

pharmacyManagementRouter.get("/:id/reviews", requireRole("admin"), async (req, res) => {
  const reviews = await Review.find({ pharmacyId: req.params.id }).sort({ createdAt: -1 }).lean();
  return successResponse(res, reviews, { canFlag: true });
});

pharmacyManagementRouter.patch(
  "/:id/badge",
  requireRole("admin"),
  body("enabled").isBoolean(),
  validateRequest,
  async (req, res) => {
    const { enabled } = req.body as { enabled: boolean };
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      { $set: { "verification.status": enabled ? "approved" : "needs_docs" } },
      { new: true },
    ).lean();

    if (!pharmacy) return errorResponse(res, "Pharmacy not found", "NOT_FOUND", 404);
    await logAudit(req, "pharmacy.badge", "Pharmacy", String(pharmacy._id), { enabled });

    return successResponse(res, { id: pharmacy._id, status: pharmacy.verification?.status });
  },
);

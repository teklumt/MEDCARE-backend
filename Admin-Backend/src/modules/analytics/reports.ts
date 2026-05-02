import { Router } from "express";
import { stringify } from "csv-stringify/sync";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { EndUser } from "../../models/EndUser.js";
import { Pharmacy } from "../../models/Pharmacy.js";
import { Order } from "../../models/Order.js";
import { Driver } from "../../models/Driver.js";
import { DiseaseAlert } from "../../models/DiseaseAlert.js";
import { errorResponse } from "../../utils/response.js";

export const reportsRouter = Router();
reportsRouter.use(requireAuth);
reportsRouter.use(requireRole("admin"));

reportsRouter.get("/export", async (req, res) => {
  const { type } = req.query as { type?: string };
  if (!type) {
    return errorResponse(res, "Missing report type", "VALIDATION_ERROR", 422);
  }

  let rows: unknown[] = [];

  if (type === "users") rows = await EndUser.find().lean();
  else if (type === "pharmacies") rows = await Pharmacy.find().lean();
  else if (type === "orders") rows = await Order.find().lean();
  else if (type === "drivers") rows = await Driver.find().lean();
  else if (type === "licenses") rows = await Pharmacy.find({}, { businessName: 1, ownerId: 1, email: 1, license: 1, verification: 1 }).lean();
  else if (type === "alerts") rows = await DiseaseAlert.find().lean();
  else return errorResponse(res, "Invalid report type", "VALIDATION_ERROR", 422);

  const csv = stringify(rows, { header: true });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${type}-report.csv`);
  return res.status(200).send(csv);
});

import { Router } from "express";
import { authAdminRouter } from "./auth/routes.js";
import { adminManagementRouter } from "./admin-management/routes.js";
import { licenseVerificationRouter } from "./license-verification/routes.js";
import { userManagementRouter } from "./user-management/routes.js";
import { pharmacyManagementRouter } from "./pharmacy-management/routes.js";
import { driverManagementRouter } from "./driver-management/routes.js";
import { diseaseAlertRouter } from "./disease-alerts/routes.js";
import { analyticsRouter } from "./analytics/routes.js";
import { reportsRouter } from "./analytics/reports.js";
import { auditLogRouter } from "./audit-logs/routes.js";

export const adminRouter = Router();

adminRouter.use("/auth", authAdminRouter);
adminRouter.use("/admins", adminManagementRouter);
adminRouter.use("/licenses", licenseVerificationRouter);
adminRouter.use("/users", userManagementRouter);
adminRouter.use("/pharmacies", pharmacyManagementRouter);
adminRouter.use("/drivers", driverManagementRouter);
adminRouter.use("/alerts", diseaseAlertRouter);
adminRouter.use("/analytics", analyticsRouter);
adminRouter.use("/reports", reportsRouter);
adminRouter.use("/audit-logs", auditLogRouter);

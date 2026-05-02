import cron from "node-cron";
import { Pharmacy } from "./models/Pharmacy.js";
import { logger } from "./utils/logger.js";

export const startCronJobs = () => {
  cron.schedule("0 1 * * *", async () => {
    try {
      const now = new Date();
      const result = await Pharmacy.updateMany(
        {
          "verification.status": "approved",
          $or: [
            { "license.businessLicenseExpiry": { $lt: now } },
            { "license.professionalLicenseExpiry": { $lt: now } },
          ],
        },
        { $set: { "verification.status": "needs_docs" } },
      );
      if (result.modifiedCount > 0) {
        logger.info("Expired licenses updated", { count: result.modifiedCount });
      }
    } catch (error) {
      logger.error("License expiry cron failed", { error });
    }
  });
};

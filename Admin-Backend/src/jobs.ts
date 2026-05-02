import cron from "node-cron";
import { Pharmacy } from "./models/Pharmacy.js";
import { logger } from "./utils/logger.js";

export const startCronJobs = () => {
  cron.schedule("0 1 * * *", async () => {
    try {
      const now = new Date();
      const result = await Pharmacy.updateMany(
        { "license.status": "verified", "license.expiryDate": { $lt: now } },
        { $set: { "license.status": "expired" } },
      );
      if (result.modifiedCount > 0) {
        logger.info("Expired licenses updated", { count: result.modifiedCount });
      }
    } catch (error) {
      logger.error("License expiry cron failed", { error });
    }
  });
};

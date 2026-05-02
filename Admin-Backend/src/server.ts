import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { startCronJobs } from "./jobs.js";
import { logger } from "./utils/logger.js";
import { seedSuperAdmin } from "./utils/seed.js";

const bootstrap = async () => {
  await connectDB();
  await seedSuperAdmin(process.env.SUPER_ADMIN_EMAIL, process.env.SUPER_ADMIN_PASSWORD);
  startCronJobs();
  app.listen(env.port, () => {
    logger.info(`Server started on port ${env.port}`);
  });
};

bootstrap().catch((error) => {
  logger.error("Failed to start server", { error });
  process.exit(1);
});

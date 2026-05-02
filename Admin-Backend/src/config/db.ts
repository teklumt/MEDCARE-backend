import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(env.mongoUri, {
    autoIndex: false,
    maxPoolSize: 20,
  });
  logger.info("MongoDB connected");
};

import path from "path";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { adminRouter } from "./modules/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { successResponse } from "./utils/response.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (_req, res) => successResponse(res, { status: "ok" }));
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

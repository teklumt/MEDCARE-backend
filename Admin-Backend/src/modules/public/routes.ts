import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { Pharmacy } from "../../models/Pharmacy.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { authRateLimiter } from "../../middleware/rateLimiter.js";

const uploadDir = path.join(process.cwd(), "uploads", "registration");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".bin";
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");
    if (!ok) {
      cb(new Error("Only images and PDF files are allowed"));
      return;
    }
    cb(null, true);
  },
});

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const publicRouter = Router();

/** Approved pharmacies for delivery signup employer search */
publicRouter.get("/pharmacies", authRateLimiter, async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const filter: Record<string, unknown> = {
    isActive: true,
    "verification.status": "approved",
  };
  if (q) {
    filter.businessName = { $regex: escapeRegex(q), $options: "i" };
  }

  const items = await Pharmacy.find(filter)
    .select("_id businessName address location phone")
    .sort({ businessName: 1 })
    .limit(40)
    .lean();

  return successResponse(res, items);
});

/** Public multipart upload for pharmacy license documents during signup */
publicRouter.post(
  "/uploads/pharmacy-license",
  authRateLimiter,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return errorResponse(res, err instanceof Error ? err.message : "Upload failed", "UPLOAD_ERROR", 400);
      }
      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return errorResponse(res, "File is required", "VALIDATION_ERROR", 400);
    }
    const host = req.get("host") ?? "localhost";
    const proto = req.protocol;
    const url = `${proto}://${host}/uploads/registration/${req.file.filename}`;
    const kind = typeof req.body.kind === "string" ? req.body.kind : undefined;
    return successResponse(res, { url, filename: req.file.filename, kind });
  },
);

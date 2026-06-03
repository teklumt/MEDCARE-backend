import { Router } from "express";
import multer from "multer";
import { authenticate, authorizeRoles } from "../middleware/auth";
import {
  bulkUploadMedications,
  createMedication,
  deleteMedication,
  getInventoryAlerts,
  getMyDeliveryAgents,
  getMyPharmacy,
  getMyPharmacyInventory,
  getMyReviews,
  getPharmacyAnalytics,
  updateMedication,
  updateMyPharmacy,
  uploadMedicationImage,
  verifyPrescription,
  rejectPrescription,
} from "../controllers/pharmacies.controller";
import { uploadMedicationImage as uploadMedicationImageMulter } from "../config/upload";
import { getPharmacyOrders } from "../controllers/orders.controller";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/me", authenticate, authorizeRoles("pharmacy"), getMyPharmacy);
router.put("/me", authenticate, authorizeRoles("pharmacy"), updateMyPharmacy);
router.get(
  "/me/delivery-agents",
  authenticate,
  authorizeRoles("pharmacy"),
  getMyDeliveryAgents,
);
router.get(
  "/me/orders",
  authenticate,
  authorizeRoles("pharmacy"),
  getPharmacyOrders,
);
router.get(
  "/me/inventory",
  authenticate,
  authorizeRoles("pharmacy"),
  getMyPharmacyInventory,
);
router.post(
  "/me/inventory",
  authenticate,
  authorizeRoles("pharmacy"),
  createMedication,
);
router.post(
  "/me/inventory/image-upload",
  authenticate,
  authorizeRoles("pharmacy"),
  (req, res, next) => {
    uploadMedicationImageMulter.single("file")(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res
            .status(400)
            .json({
              success: false,
              error: "File too large. Maximum size is 5MB.",
            });
          return;
        }
        res.status(400).json({ success: false, error: err.message });
        return;
      }
      if (err) {
        res.status(400).json({
          success: false,
          error: err instanceof Error ? err.message : "Invalid file upload.",
        });
        return;
      }
      next();
    });
  },
  uploadMedicationImage,
);
router.post(
  "/me/inventory/bulk-upload",
  authenticate,
  authorizeRoles("pharmacy"),
  upload.single("file"),
  bulkUploadMedications,
);
router.patch(
  "/me/inventory/:id",
  authenticate,
  authorizeRoles("pharmacy"),
  updateMedication,
);
router.delete(
  "/me/inventory/:id",
  authenticate,
  authorizeRoles("pharmacy"),
  deleteMedication,
);
router.get(
  "/me/inventory/alerts",
  authenticate,
  authorizeRoles("pharmacy"),
  getInventoryAlerts,
);
router.get(
  "/me/analytics",
  authenticate,
  authorizeRoles("pharmacy"),
  getPharmacyAnalytics,
);
router.get(
  "/me/reviews",
  authenticate,
  authorizeRoles("pharmacy"),
  getMyReviews,
);

router.patch(
  "/prescriptions/:id/verify",
  authenticate,
  authorizeRoles("pharmacy"),
  verifyPrescription,
);
router.patch(
  "/prescriptions/:id/reject",
  authenticate,
  authorizeRoles("pharmacy"),
  rejectPrescription,
);

export default router;

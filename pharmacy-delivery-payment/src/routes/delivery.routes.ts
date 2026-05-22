import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorizeRoles } from '../middleware/auth';
import {
  getMyAssignedOrders,
  startDeliveryTrip,
  confirmDriverHandoff,
  getMyDeliveryHistory,
  getMyDeliveryEarnings,
  updateDriverLocation,
  getMyDeliveryStatus,
  setMyDeliveryOnlineStatus,
  getMyDeliveryProfile,
  uploadDeliveryProfilePhoto,
  deleteDeliveryProfilePhoto
} from '../controllers/delivery.controller';
import { uploadDeliveryProfile as uploadDeliveryProfileMulter } from '../config/upload';

const router = Router();

router.get('/me/profile', authenticate, authorizeRoles('delivery'), getMyDeliveryProfile);
router.post(
  '/me/profile-photo',
  authenticate,
  authorizeRoles('delivery'),
  (req, res, next) => {
    uploadDeliveryProfileMulter.single('file')(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ success: false, error: 'File too large. Maximum size is 5MB.' });
          return;
        }
        res.status(400).json({ success: false, error: err.message });
        return;
      }
      if (err) {
        res.status(400).json({
          success: false,
          error: err instanceof Error ? err.message : 'Invalid file upload.'
        });
        return;
      }
      next();
    });
  },
  uploadDeliveryProfilePhoto
);
router.delete('/me/profile-photo', authenticate, authorizeRoles('delivery'), deleteDeliveryProfilePhoto);

router.get('/me/status', authenticate, authorizeRoles('delivery'), getMyDeliveryStatus);
router.patch('/me/status', authenticate, authorizeRoles('delivery'), setMyDeliveryOnlineStatus);
router.get('/me/orders', authenticate, authorizeRoles('delivery'), getMyAssignedOrders);
router.get('/me/history', authenticate, authorizeRoles('delivery'), getMyDeliveryHistory);
router.get('/me/earnings', authenticate, authorizeRoles('delivery'), getMyDeliveryEarnings);
router.patch('/orders/:id/start-trip', authenticate, authorizeRoles('delivery'), startDeliveryTrip);
router.patch('/orders/:id/confirm-handoff', authenticate, authorizeRoles('delivery'), confirmDriverHandoff);
router.patch('/me/location', authenticate, authorizeRoles('delivery'), updateDriverLocation);

export default router;

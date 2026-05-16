import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import {
  getMyAssignedOrders,
  startDeliveryTrip,
  confirmDriverHandoff,
  getMyDeliveryHistory,
  getMyDeliveryEarnings,
  updateDriverLocation,
  getMyDeliveryStatus,
  setMyDeliveryOnlineStatus
} from '../controllers/delivery.controller';

const router = Router();

router.get('/me/status', authenticate, authorizeRoles('delivery'), getMyDeliveryStatus);
router.patch('/me/status', authenticate, authorizeRoles('delivery'), setMyDeliveryOnlineStatus);
router.get('/me/orders', authenticate, authorizeRoles('delivery'), getMyAssignedOrders);
router.get('/me/history', authenticate, authorizeRoles('delivery'), getMyDeliveryHistory);
router.get('/me/earnings', authenticate, authorizeRoles('delivery'), getMyDeliveryEarnings);
router.patch('/orders/:id/start-trip', authenticate, authorizeRoles('delivery'), startDeliveryTrip);
router.patch('/orders/:id/confirm-handoff', authenticate, authorizeRoles('delivery'), confirmDriverHandoff);
router.patch('/me/location', authenticate, authorizeRoles('delivery'), updateDriverLocation);

export default router;

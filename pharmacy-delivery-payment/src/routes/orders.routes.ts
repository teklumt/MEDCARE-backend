import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import {
  cancelOrder,
  completeOrderPayment,
  confirmPatientReceipt,
  createOrder,
  getOrderById,
  getOrderTracking,
  getOrders,
  updateOrderStatus
} from '../controllers/orders.controller';

const router = Router();

router.post('/', authenticate, authorizeRoles('patient'), createOrder);
router.post('/:id/complete-payment', authenticate, authorizeRoles('patient'), completeOrderPayment);
router.get('/', authenticate, authorizeRoles('patient'), getOrders);
router.patch('/:id/confirm-receipt', authenticate, authorizeRoles('patient'), confirmPatientReceipt);
router.get('/:id', authenticate, getOrderById);
router.patch('/:id/status', authenticate, authorizeRoles('pharmacy'), updateOrderStatus);
router.get('/:id/tracking', authenticate, getOrderTracking);
router.delete('/:id', authenticate, authorizeRoles('patient'), cancelOrder);

export default router;

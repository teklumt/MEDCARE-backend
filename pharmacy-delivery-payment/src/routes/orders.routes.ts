import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import {
  cancelOrder,
  createOrder,
  getOrderById,
  getOrderTracking,
  getOrders,
  updateOrderStatus
} from '../controllers/orders.controller';

const router = Router();

router.post('/', authenticate, authorizeRoles('patient'), createOrder);
router.get('/', authenticate, authorizeRoles('patient'), getOrders);
router.get('/:id', authenticate, getOrderById);
router.patch('/:id/status', authenticate, authorizeRoles('pharmacy'), updateOrderStatus);
router.get('/:id/tracking', authenticate, getOrderTracking);
router.delete('/:id', authenticate, authorizeRoles('patient'), cancelOrder);

export default router;

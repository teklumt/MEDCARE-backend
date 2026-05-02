import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  chapaWebhook,
  getPaymentById,
  initiateChapaPayment,
  verifyPayment
} from '../controllers/payments.controller';

const router = Router();

router.post('/chapa/initiate', authenticate, initiateChapaPayment);
router.post('/chapa/webhook', chapaWebhook);
router.get('/:id', authenticate, getPaymentById);
router.get('/:id/verify', authenticate, verifyPayment);

export default router;

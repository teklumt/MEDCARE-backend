import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import {
  getCommissionSummary,
  initiateCommissionChapa,
  getCommissionPaymentById,
  verifyCommissionPaymentById
} from '../controllers/commission.controller';

const router = Router();
const pharmacyOnly = authorizeRoles('pharmacy');

router.use(authenticate);

router.get('/summary', pharmacyOnly, getCommissionSummary);
router.post('/chapa/initiate', pharmacyOnly, initiateCommissionChapa);
router.get('/:id/verify', pharmacyOnly, verifyCommissionPaymentById);
router.get('/:id', pharmacyOnly, getCommissionPaymentById);

export default router;

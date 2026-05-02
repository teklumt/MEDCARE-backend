import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import {
  addPharmacyReview,
  getPharmacyById,
  getPharmacyInventory,
  getPharmacyReviews,
  listPharmacies
} from '../controllers/pharmacies.controller';

const router = Router();

router.get('/', listPharmacies);
router.get('/:id', getPharmacyById);
router.get('/:id/inventory', getPharmacyInventory);
router.get('/:id/reviews', getPharmacyReviews);
router.post('/:id/reviews', authenticate, authorizeRoles('patient'), addPharmacyReview);

export default router;

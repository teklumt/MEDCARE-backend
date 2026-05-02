import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { getPrescription, uploadPrescription } from '../controllers/prescriptions.controller';
import { verifyPrescription } from '../controllers/pharmacies.controller';
import { uploadPrescription as uploadPrescriptionMulter } from '../config/upload';

const router = Router();

// Upload prescription with file handling
router.post(
  '/upload', 
  authenticate, 
  authorizeRoles('patient'), 
  uploadPrescriptionMulter.single('file'), 
  uploadPrescription
);

router.get('/:id', authenticate, getPrescription);
router.patch('/:id/verify', authenticate, authorizeRoles('pharmacy'), verifyPrescription);

export default router;

import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { getPrescription, uploadPrescription } from '../controllers/prescriptions.controller';
import { verifyPrescription } from '../controllers/pharmacies.controller';

const router = Router();

router.post('/upload', authenticate, authorizeRoles('patient'), uploadPrescription);
router.get('/:id', authenticate, getPrescription);
router.patch('/:id/verify', authenticate, authorizeRoles('pharmacy'), verifyPrescription);

export default router;

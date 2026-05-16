import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { getPrescription, uploadPrescription, scanPrescription } from '../controllers/prescriptions.controller';
import { verifyPrescription } from '../controllers/pharmacies.controller';
import { uploadPrescription as uploadPrescriptionMulter, scanPrescriptionMemory } from '../config/upload';

const router = Router();

// Upload prescription with file handling
router.post(
  '/upload',
  authenticate,
  authorizeRoles('patient'),
  uploadPrescriptionMulter.single('file'),
  uploadPrescription
);

router.post(
  '/scan',
  authenticate,
  authorizeRoles('patient'),
  (req, res, next) => {
    scanPrescriptionMemory.single('file')(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB.' });
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
  scanPrescription
);

router.get('/:id', authenticate, getPrescription);
router.patch('/:id/verify', authenticate, authorizeRoles('pharmacy'), verifyPrescription);

export default router;

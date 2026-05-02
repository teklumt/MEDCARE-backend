import { Router } from 'express';
import { getMedicationById } from '../controllers/medications.controller';

const router = Router();

router.get('/:id', getMedicationById);

export default router;

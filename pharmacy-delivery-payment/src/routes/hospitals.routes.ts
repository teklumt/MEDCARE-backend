import { Router } from 'express';
import { getHospitalById, listHospitals } from '../controllers/hospitals.controller';

const router = Router();

router.get('/', listHospitals);
router.get('/:id', getHospitalById);

export default router;

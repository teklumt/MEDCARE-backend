import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createComplaint, getComplaint } from '../controllers/complaints.controller';

const router = Router();

router.post('/', authenticate, createComplaint);
router.get('/:id', authenticate, getComplaint);

export default router;

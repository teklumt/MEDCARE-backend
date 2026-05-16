import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { createComplaint, getComplaint, listMyComplaints } from '../controllers/complaints.controller';

const router = Router();

const reporterOnly = authorizeRoles('patient', 'pharmacy');

router.post('/', authenticate, reporterOnly, createComplaint);
router.get('/me', authenticate, reporterOnly, listMyComplaints);
router.get('/:id', authenticate, getComplaint);

export default router;

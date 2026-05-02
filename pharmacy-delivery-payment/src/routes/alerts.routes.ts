import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createAlert, deactivateAlert, getActiveAlert } from '../controllers/alerts.controller';

const router = Router();

router.get('/active', getActiveAlert);
router.post('/', authenticate, createAlert);
router.patch('/:id', authenticate, deactivateAlert);

export default router;

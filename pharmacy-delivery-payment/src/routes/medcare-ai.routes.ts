import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { sendMedcareAiChat } from '../controllers/medcare-ai.controller';

const router = Router();

router.post('/chat', authenticate, sendMedcareAiChat);

export default router;

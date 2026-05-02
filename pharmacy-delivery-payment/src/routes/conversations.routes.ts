import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createConversation,
  getMessages,
  listConversations,
  markConversationRead,
  sendMessage
} from '../controllers/conversations.controller';

const router = Router();

router.use(authenticate);
router.get('/', listConversations);
router.post('/', createConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);
router.patch('/:id/read', markConversationRead);

export default router;

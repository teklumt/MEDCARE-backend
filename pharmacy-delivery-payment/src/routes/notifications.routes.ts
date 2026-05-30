import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { listNotifications, markNotificationsRead } from '../controllers/notifications.controller';

const router = Router();

const roles = authorizeRoles('patient', 'pharmacy', 'delivery', 'admin');

router.get('/', authenticate, roles, listNotifications);
router.patch('/read', authenticate, roles, markNotificationsRead);

export default router;

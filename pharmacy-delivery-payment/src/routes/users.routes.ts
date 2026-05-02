import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  addAddress,
  deleteAddress,
  getAddresses,
  getMe,
  setDefaultAddress,
  updateAddress,
  updateMe
} from '../controllers/users.controller';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.put('/me', updateMe);
router.get('/me/addresses', getAddresses);
router.post('/me/addresses', addAddress);
router.put('/me/addresses/:id', updateAddress);
router.delete('/me/addresses/:id', deleteAddress);
router.patch('/me/addresses/:id/default', setDefaultAddress);

export default router;

import { Router } from 'express';
import {
  userSignup,
  pharmacySignup,
  deliverySignup,
  login,
  refreshToken,
  logout,
  getProfile
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  userSignupSchema,
  pharmacySignupSchema,
  deliverySignupSchema,
  loginSchema,
  refreshTokenSchema
} from '../validators/auth.validator';

const router: Router = Router();

// Public routes
router.post('/user/signup', validate(userSignupSchema), userSignup);
router.post('/pharmacy/signup', validate(pharmacySignupSchema), pharmacySignup);
router.post('/delivery/signup', validate(deliverySignupSchema), deliverySignup);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);

export default router;

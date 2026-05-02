import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

const authDisabled = (_req: AuthRequest, res: Response): void => {
  res.status(501).json({
    success: false,
    error: 'Authentication is handled by an external service for this backend.'
  });
};

export const userSignup = authDisabled;
export const pharmacySignup = authDisabled;
export const deliverySignup = authDisabled;
export const login = authDisabled;
export const refreshToken = authDisabled;
export const logout = authDisabled;
export const getProfile = authDisabled;

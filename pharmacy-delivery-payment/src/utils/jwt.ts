import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'pharmacy' | 'delivery';
}

export const generateAccessToken = (userId: Types.ObjectId, email: string, role: 'user' | 'pharmacy' | 'delivery'): string => {
  return jwt.sign(
    { userId: userId.toString(), email, role },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRE || '24h') as any }
  );
};

export const generateRefreshToken = (userId: Types.ObjectId, email: string, role: 'user' | 'pharmacy' | 'delivery'): string => {
  return jwt.sign(
    { userId: userId.toString(), email, role },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRE || '7d') as any }
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as TokenPayload;
};

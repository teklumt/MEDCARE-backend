import type { UserRole } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        role: UserRole;
        mfaEnabled: boolean;
        permissions: string[];
      };
      requestId?: string;
    }
  }
}

export {};

import type { AdminRole } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        role: AdminRole;
        mfaEnabled: boolean;
        permissions: string[];
      };
      requestId?: string;
    }
  }
}

export {};

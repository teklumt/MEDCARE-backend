import { signAccessToken } from "../src/utils/tokens.js";

export const testAdmin = {
  id: "507f1f77bcf86cd799439011",
  email: "admin@medcare-et.com",
  role: "admin" as const,
  mfa: false,
  permissions: ["*"],
};

export const testPatient = {
  id: "507f1f77bcf86cd799439012",
  email: "patient@test.com",
  role: "patient" as const,
  mfa: false,
  permissions: [],
};

export function adminToken(overrides?: Partial<typeof testAdmin>): string {
  const u = { ...testAdmin, ...overrides };
  return signAccessToken({ sub: u.id, role: u.role, mfa: u.mfa, permissions: u.permissions });
}

export function patientToken(): string {
  return signAccessToken({
    sub: testPatient.id,
    role: testPatient.role,
    mfa: testPatient.mfa,
    permissions: testPatient.permissions,
  });
}

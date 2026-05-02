export type AdminRole = "admin";
export type UserRole = "patient" | "pharmacy" | "delivery" | "admin";

export const rolePermissions: Record<AdminRole, string[]> = {
  admin: ["*"],
};

export const allRolePermissions: Record<UserRole, string[]> = {
  admin: ["*"],
  patient: ["order.create", "order.read", "pharmacy.read"],
  pharmacy: ["order.read", "order.update", "medicine.manage"],
  delivery: ["order.read", "order.update", "delivery.manage"],
};

export const sensitiveActions = new Set(["admin.delete", "admin.suspend"]);

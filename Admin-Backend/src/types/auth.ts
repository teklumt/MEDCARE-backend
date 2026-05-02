export type AdminRole = "super_admin" | "admin" | "moderator";

export const rolePermissions: Record<AdminRole, string[]> = {
  super_admin: ["*"],
  admin: [
    "licenses.verify",
    "users.ban",
    "pharmacies.manage",
    "analytics.view",
    "drivers.manage",
    "alerts.manage",
  ],
  moderator: ["reports.view", "activity.flag", "analytics.read"],
};

export const sensitiveActions = new Set([
  "admin.delete",
  "admin.suspend",
  "user.ban",
  "license.revoke",
  "pharmacy.suspend",
  "driver.suspend",
]);

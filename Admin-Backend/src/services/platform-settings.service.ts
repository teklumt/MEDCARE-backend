import { PlatformConfig } from "../models/PlatformConfig.js";

const KEY_PLATFORM_NAME = "platform.name";
const KEY_SUPPORT_EMAIL = "platform.support_email";
const KEY_COMMISSION_RATE = "platform.commission_rate_percent";
const KEY_DELIVERY_RADIUS = "platform.default_delivery_radius_km";
const KEY_MAINTENANCE_MODE = "platform.maintenance_mode";

const ALL_KEYS = [
  KEY_PLATFORM_NAME,
  KEY_SUPPORT_EMAIL,
  KEY_COMMISSION_RATE,
  KEY_DELIVERY_RADIUS,
  KEY_MAINTENANCE_MODE,
] as const;

export type PlatformGeneralSettings = {
  platformName: string;
  supportEmail: string;
  commissionRatePercent: number;
  defaultDeliveryRadiusKm: number;
  maintenanceMode: boolean;
};

const DEFAULTS: PlatformGeneralSettings = {
  platformName: "MedCare Platform",
  supportEmail: "support@medcare.com",
  commissionRatePercent: 5,
  defaultDeliveryRadiusKm: 10,
  maintenanceMode: false,
};

function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return DEFAULTS.commissionRatePercent;
  return Math.min(100, Math.max(0, n));
}

function clampRadius(n: number): number {
  if (!Number.isFinite(n)) return DEFAULTS.defaultDeliveryRadiusKm;
  return Math.min(500, Math.max(0.1, n));
}

async function loadRaw(): Promise<Record<string, string>> {
  const docs = await PlatformConfig.find({ key: { $in: [...ALL_KEYS] } }).lean();
  const map: Record<string, string> = {};
  for (const d of docs) map[d.key] = d.value;
  return map;
}

export async function getGeneralPlatformSettings(): Promise<PlatformGeneralSettings> {
  const raw = await loadRaw();
  const commission = Number(raw[KEY_COMMISSION_RATE]);
  const radius = Number(raw[KEY_DELIVERY_RADIUS]);
  return {
    platformName: raw[KEY_PLATFORM_NAME]?.trim() || DEFAULTS.platformName,
    supportEmail: raw[KEY_SUPPORT_EMAIL]?.trim() || DEFAULTS.supportEmail,
    commissionRatePercent: clampPercent(
      Number.isFinite(commission) ? commission : DEFAULTS.commissionRatePercent,
    ),
    defaultDeliveryRadiusKm: clampRadius(
      Number.isFinite(radius) ? radius : DEFAULTS.defaultDeliveryRadiusKm,
    ),
    maintenanceMode: raw[KEY_MAINTENANCE_MODE] === "true",
  };
}

export async function upsertGeneralPlatformSettings(
  partial: Partial<PlatformGeneralSettings>,
): Promise<PlatformGeneralSettings> {
  const ops: Array<{ key: string; value: string }> = [];

  if (partial.platformName !== undefined) {
    ops.push({ key: KEY_PLATFORM_NAME, value: partial.platformName.trim() });
  }
  if (partial.supportEmail !== undefined) {
    ops.push({ key: KEY_SUPPORT_EMAIL, value: partial.supportEmail.trim().toLowerCase() });
  }
  if (partial.commissionRatePercent !== undefined) {
    ops.push({
      key: KEY_COMMISSION_RATE,
      value: String(clampPercent(partial.commissionRatePercent)),
    });
  }
  if (partial.defaultDeliveryRadiusKm !== undefined) {
    ops.push({
      key: KEY_DELIVERY_RADIUS,
      value: String(clampRadius(partial.defaultDeliveryRadiusKm)),
    });
  }
  if (partial.maintenanceMode !== undefined) {
    ops.push({ key: KEY_MAINTENANCE_MODE, value: partial.maintenanceMode ? "true" : "false" });
  }

  await Promise.all(
    ops.map(({ key, value }) =>
      PlatformConfig.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true }),
    ),
  );

  return getGeneralPlatformSettings();
}

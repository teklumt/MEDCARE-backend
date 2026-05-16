import PlatformConfig from '../models/PlatformConfig';

export const COMMISSION_ETB_PER_ORDER_KEY = 'platform.commission_etb_per_delivered_order';

/** Flat ETB per delivered order — shared Mongo PlatformConfig key (Admin writes; pharmacy reads). */
export async function getCommissionEtbPerDeliveredOrder(): Promise<number> {
  const doc = await PlatformConfig.findOne({ key: COMMISSION_ETB_PER_ORDER_KEY }).lean();
  const n = doc?.value != null ? Number(String(doc.value)) : NaN;
  if (!Number.isFinite(n)) return 5;
  return Math.min(1000, Math.max(0, n));
}

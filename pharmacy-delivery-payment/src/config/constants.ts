export const USER_ROLES = ['patient', 'pharmacy'] as const;

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'dispatched',
  'delivered',
  'cancelled',
  'rejected'
] as const;

export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['dispatched', 'cancelled'],
  dispatched: ['delivered'],
  delivered: [],
  rejected: [],
  cancelled: []
};

export const PAYMENT_METHODS = ['chapa', 'cod'] as const;

export const PAYMENT_STATUSES = [
  'pending',
  'initiated',
  'success',
  'failed',
  'refunded',
  'reversed',
  'cod_pending',
  'cod_collected'
] as const;

export const DELIVERY_METHODS = ['pickup', 'delivery'] as const;

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_SEARCH_RESULTS = 20;

export type UserRole = typeof USER_ROLES[number];
export type OrderStatus = typeof ORDER_STATUSES[number];
export type PaymentMethod = typeof PAYMENT_METHODS[number];
export type PaymentStatus = typeof PAYMENT_STATUSES[number];
export type DeliveryMethod = typeof DELIVERY_METHODS[number];

// Legacy exports retained for compatibility with unused modules
export const DOSAGE_FORMS = [
  'tablet',
  'capsule',
  'syrup',
  'injection',
  'cream',
  'drops',
  'inhaler',
  'patch',
  'other'
] as const;

export const MEDICATION_CATEGORIES = [
  'antibiotic',
  'painkiller',
  'vitamin',
  'chronic_disease',
  'emergency',
  'cardiovascular',
  'diabetes',
  'respiratory',
  'other'
] as const;

export const INVENTORY_STATUSES = ['available', 'out_of_stock', 'low_stock', 'expiring_soon'] as const;

export const DRIVER_STATUSES = ['available', 'on_delivery', 'offline', 'suspended'] as const;

export const AUDIT_ACTIONS = {
  INVENTORY_ITEM_ADDED: 'INVENTORY_ITEM_ADDED',
  INVENTORY_ITEM_UPDATED: 'INVENTORY_ITEM_UPDATED',
  INVENTORY_ITEM_DELETED: 'INVENTORY_ITEM_DELETED',
  INVENTORY_BULK_UPLOAD: 'INVENTORY_BULK_UPLOAD',
  ORDER_ACCEPTED: 'ORDER_ACCEPTED',
  ORDER_REJECTED: 'ORDER_REJECTED',
  ORDER_STATUS_UPDATED: 'ORDER_STATUS_UPDATED',
  DELIVERY_ASSIGNED: 'DELIVERY_ASSIGNED',
  DELIVERY_COMPLETED: 'DELIVERY_COMPLETED',
  PAYMENT_COLLECTED: 'PAYMENT_COLLECTED',
  PROFILE_UPDATED: 'PROFILE_UPDATED'
} as const;

export const TIME_LIMITS = {
  ORDER_STUCK_MINUTES: 30,
  EXPIRING_SOON_DAYS: 30,
  MESSAGE_RETENTION_DAYS: 90,
  ALERT_RESEND_DAYS: 7
} as const;

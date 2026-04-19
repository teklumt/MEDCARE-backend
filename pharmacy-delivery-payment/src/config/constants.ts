export const DOSAGE_FORMS = [
  'tablet', 'capsule', 'syrup', 'injection', 
  'cream', 'drops', 'inhaler', 'patch', 'other'
] as const;

export const MEDICATION_CATEGORIES = [
  'antibiotic', 'painkiller', 'vitamin', 'chronic_disease', 
  'emergency', 'cardiovascular', 'diabetes', 'respiratory', 'other'
] as const;

export const ORDER_STATUSES = [
  'pending', 'accepted', 'rejected', 'preparing', 
  'ready', 'out_for_delivery', 'delivered', 'cancelled'
] as const;

export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  'pending': ['accepted', 'rejected', 'cancelled'],
  'accepted': ['preparing', 'cancelled'],
  'preparing': ['ready', 'cancelled'],
  'ready': ['out_for_delivery', 'cancelled'],
  'out_for_delivery': ['delivered'],
  'delivered': [],
  'rejected': [],
  'cancelled': []
};

export const INVENTORY_STATUSES = [
  'available', 'out_of_stock', 'low_stock', 'expiring_soon'
] as const;

export const DRIVER_STATUSES = [
  'available', 'on_delivery', 'offline', 'suspended'
] as const;

export const PAYMENT_METHODS = ['chapa', 'cash_on_delivery'] as const;

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;

export const DELIVERY_METHODS = ['pickup', 'delivery'] as const;

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

export const PERFORMANCE_THRESHOLDS = {
  MIN_COMPLETION_RATE: 80,
  MIN_ON_TIME_RATE: 70
} as const;

export const TIME_LIMITS = {
  ORDER_STUCK_MINUTES: 30,
  EXPIRING_SOON_DAYS: 30,
  MESSAGE_RETENTION_DAYS: 90,
  ALERT_RESEND_DAYS: 7
} as const;

export const MAX_CONCURRENT_DELIVERIES = 5;
export const MAX_SEARCH_RESULTS = 10;
export const MAX_CSV_SIZE_MB = 10;
export const MAX_IMAGE_SIZE_MB = 5;

export const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 
  'friday', 'saturday', 'sunday'
] as const;

export type DosageForm = typeof DOSAGE_FORMS[number];
export type MedicationCategory = typeof MEDICATION_CATEGORIES[number];
export type OrderStatus = typeof ORDER_STATUSES[number];
export type InventoryStatus = typeof INVENTORY_STATUSES[number];
export type DriverStatus = typeof DRIVER_STATUSES[number];
export type PaymentMethod = typeof PAYMENT_METHODS[number];
export type PaymentStatus = typeof PAYMENT_STATUSES[number];
export type DeliveryMethod = typeof DELIVERY_METHODS[number];
export type DayOfWeek = typeof DAYS_OF_WEEK[number];
export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

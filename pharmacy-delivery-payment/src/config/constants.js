module.exports = {
  // Dosage forms
  DOSAGE_FORMS: [
    'tablet', 'capsule', 'syrup', 'injection', 
    'cream', 'drops', 'inhaler', 'patch', 'other'
  ],

  // Medication categories
  MEDICATION_CATEGORIES: [
    'antibiotic', 'painkiller', 'vitamin', 'chronic_disease', 
    'emergency', 'cardiovascular', 'diabetes', 'respiratory', 'other'
  ],

  // Order statuses
  ORDER_STATUSES: [
    'pending', 'accepted', 'rejected', 'preparing', 
    'ready', 'out_for_delivery', 'delivered', 'cancelled'
  ],

  // Order status transitions (state machine)
  ORDER_STATUS_TRANSITIONS: {
    'pending': ['accepted', 'rejected', 'cancelled'],
    'accepted': ['preparing', 'cancelled'],
    'preparing': ['ready', 'cancelled'],
    'ready': ['out_for_delivery', 'cancelled'],
    'out_for_delivery': ['delivered'],
    'delivered': [],
    'rejected': [],
    'cancelled': []
  },

  // Inventory statuses
  INVENTORY_STATUSES: [
    'available', 'out_of_stock', 'low_stock', 'expiring_soon'
  ],

  // Driver statuses
  DRIVER_STATUSES: [
    'available', 'on_delivery', 'offline', 'suspended'
  ],

  // Payment methods
  PAYMENT_METHODS: ['chapa', 'cash_on_delivery'],

  // Payment statuses
  PAYMENT_STATUSES: ['pending', 'paid', 'failed', 'refunded'],

  // Delivery methods
  DELIVERY_METHODS: ['pickup', 'delivery'],

  // Audit log actions
  AUDIT_ACTIONS: {
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
  },

  // Performance thresholds
  PERFORMANCE_THRESHOLDS: {
    MIN_COMPLETION_RATE: 80, // percentage
    MIN_ON_TIME_RATE: 70 // percentage
  },

  // Time limits
  TIME_LIMITS: {
    ORDER_STUCK_MINUTES: 30,
    EXPIRING_SOON_DAYS: 30,
    MESSAGE_RETENTION_DAYS: 90,
    ALERT_RESEND_DAYS: 7
  },

  // Limits
  MAX_CONCURRENT_DELIVERIES: 5,
  MAX_SEARCH_RESULTS: 10,
  MAX_CSV_SIZE_MB: 10,
  MAX_IMAGE_SIZE_MB: 5,

  // Days of week
  DAYS_OF_WEEK: [
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  ]
};

import { Document, Types } from 'mongoose';

// User Types
export interface IUser extends Document {
  fullName: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: 'end_user';
  region?: string;
  city?: string;
  status: 'active' | 'banned' | 'suspended';
  ban: {
    isBanned: boolean;
    reason?: string;
    type?: 'temporary' | 'permanent';
    expiresAt?: Date;
    bannedBy?: Types.ObjectId;
  };
  warningCount: number;
  trustScore: number;
  isVerified: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Pharmacy Types
export interface IPharmacy extends Document {
  businessName: string;
  nameAmharic?: string;
  ownerName: string;
  email: string;
  phone: string;
  passwordHash: string;
  description?: string;
  website?: string;
  profileImageUrl?: string;
  address: {
    region?: string;
    city?: string;
    street?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  license: {
    licenseNumber?: string;
    licenseImageUrl?: string;
    tinNumber?: string;
    expiryDate?: Date;
    status: 'not_submitted' | 'pending' | 'verified' | 'rejected' | 'revoked' | 'expired';
    rejectionReason?: string;
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
  };
  status: 'active' | 'suspended' | 'deactivated';
  suspendedReason?: string;
  suspendedBy?: Types.ObjectId;
  isVerifiedBadge: boolean;
  rating: number;
  totalRatings: number;
  operatingHours: Array<{
    day: string;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
    is24Hours: boolean;
  }>;
  deliverySettings: {
    enabled: boolean;
    radiusKm: number;
    minOrderForFreeDelivery: number;
    baseDeliveryFee: number;
    maxConcurrentDeliveries: number;
  };
  mfa: {
    enabled: boolean;
    secret?: string;
  };
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Master Medication Types
export interface IMasterMedication extends Document {
  nameEnglish: string;
  nameAmharic: string;
  genericName?: string;
  dosageStrength?: string;
  dosageForm?: string;
  category?: string;
  requiresPrescription: boolean;
  controlledSubstance: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Inventory Types
export interface IInventory extends Document {
  pharmacyId: Types.ObjectId;
  medicationId: Types.ObjectId;
  stock: {
    quantity: number;
    lowThreshold: number;
    batchNumber?: string;
    expiryDate: Date;
  };
  pricing: {
    costPrice?: number;
    sellingPrice: number;
  };
  imageUrl?: string;
  supplierName?: string;
  storageRequirements?: string;
  specialInstructions?: string;
  availability: {
    status: 'available' | 'out_of_stock' | 'low_stock' | 'expiring_soon';
    deliveryEligible: boolean;
    maxOrderQuantity?: number;
  };
  prescription: {
    verificationMode: 'manual' | 'automatic' | 'not_required';
    validityPeriod?: number;
  };
  version: number;
  isDeleted: boolean;
  deletedAt?: Date;
  lastRestockedAt?: Date;
  alerts: {
    expirationWarningSent: boolean;
    expirationWarningDate?: Date;
    lowStockWarningSent: boolean;
    lowStockWarningDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface IOrder extends Document {
  orderId: string;
  patientId: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  driverId?: Types.ObjectId;
  items: Array<{
    medicineId: Types.ObjectId;
    medicineName: string;
    quantity: number;
    priceAtOrder: number;
  }>;
  totalAmount: number;
  delivery: {
    method: 'pickup' | 'delivery';
    address?: {
      region?: string;
      city?: string;
      street?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  };
  payment: {
    method: 'chapa' | 'cash_on_delivery';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId?: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  statusHistory: Array<{
    status: string;
    updatedBy?: Types.ObjectId;
    updatedByRole?: string;
    note?: string;
    timestamp: Date;
  }>;
  notes: {
    patient?: string;
    pharmacist?: string;
  };
  prescriptionImageUrl?: string;
  estimatedPreparationTime?: number;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  reminderSent: boolean;
  reminderSentAt?: Date;
  stockReserved: boolean;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Driver Types
export interface IDriver extends Document {
  fullName: string;
  phone: string;
  email?: string;
  passwordHash: string;
  nationalId?: string;
  licenseNumber?: string;
  licenseImageUrl?: string;
  vehicle: {
    type?: 'motorcycle' | 'bicycle' | 'car';
    plate?: string;
  };
  region?: string;
  city?: string;
  assignedPharmacyId?: Types.ObjectId;
  status: 'available' | 'on_delivery' | 'offline' | 'suspended';
  backgroundCheck: {
    status: 'pending' | 'cleared' | 'failed';
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
  };
  isSuspended: boolean;
  suspendedReason?: string;
  suspendedBy?: Types.ObjectId;
  rating: number;
  totalDeliveries: number;
  activeDeliveryCount: number;
  maxConcurrentDeliveries: number;
  currentLocation: {
    coordinates?: {
      lat: number;
      lng: number;
    };
    lastUpdated?: Date;
  };
  performance: {
    totalDeliveries: number;
    completedOnTime: number;
    averageDeliveryTime?: number;
    completionRate: number;
  };
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log Types
export interface IAuditLog extends Document {
  entityType: 'inventory' | 'order' | 'delivery' | 'profile' | 'payment';
  entityId: Types.ObjectId;
  pharmacyId?: Types.ObjectId;
  action: string;
  performedBy: Types.ObjectId;
  performedByRole?: 'pharmacy' | 'driver' | 'admin';
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Chat Types
export interface IChatSession extends Document {
  patientId: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  orderId?: Types.ObjectId;
  sessionKey: {
    encryptedForPatient?: string;
    encryptedForPharmacy?: string;
  };
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  unreadCount: {
    patient: number;
    pharmacy: number;
  };
  status: 'active' | 'closed' | 'archived';
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatMessage extends Document {
  sessionId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole: 'patient' | 'pharmacy';
  encryptedContent: string;
  iv: string;
  authTag?: string;
  deliveryStatus: 'sent' | 'delivered' | 'read';
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Admin Types
export interface IAdmin extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'super_admin' | 'admin' | 'moderator';
  mfa: {
    enabled: boolean;
    secret?: string;
  };
  status: 'active' | 'suspended';
  suspendedReason?: string;
  createdBy?: Types.ObjectId;
  lastLoginAt?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

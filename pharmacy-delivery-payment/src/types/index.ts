import { Document, Types } from 'mongoose';

export interface IUserAddress {
  _id?: Types.ObjectId;
  label?: string;
  recipientName?: string;
  phone?: string;
  street?: string;
  subCity?: string;
  city?: string;
  additionalInfo?: string;
  isDefault?: boolean;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface IUser extends Document {
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'patient' | 'pharmacy' | 'admin' | 'delivery';
  language: 'en' | 'am';
  isActive: boolean;
  isLocked: boolean;
  lockExpiresAt?: Date | null;
  failedLoginAttempts: number;
  mfa: {
    enabled: boolean;
    secret?: string | null;
    backupCodes: string[];
  };
  addresses: IUserAddress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPharmacy extends Document {
  ownerId: Types.ObjectId;
  businessName: string;
  location?: string;
  address?: string;
  coordinates: {
    type: 'Point';
    coordinates: number[];
  };
  phone?: string;
  email?: string;
  description?: string;
  openingHours?: string;
  deliveryAvailable: boolean;
  deliveryFee: number;
  deliveryRadiusKm?: number;
  license: {
    businessLicenseNumber?: string;
    businessLicenseExpiry?: Date;
    professionalLicenseExpiry?: Date;
  };
  verification: {
    status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'needs_docs';
    verifiedAt?: Date;
    verifiedById?: Types.ObjectId;
    rejectionNote?: string | null;
    documents: {
      businessRegistration?: { url?: string; status?: string; uploadedAt?: Date };
      operatingLicense?: { url?: string; status?: string; uploadedAt?: Date };
      inspectionReport?: { url?: string; status?: string; uploadedAt?: Date };
    };
  };
  stats: {
    rating: number;
    reviewCount: number;
  };
  isActive: boolean;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMedication extends Document {
  pharmacyId: Types.ObjectId;
  name: string;
  genericName?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  batchNumber?: string;
  expiryDate: Date;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: 'adequate' | 'low_stock' | 'out_of_stock';
  requiresPrescription: boolean;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  _id?: Types.ObjectId;
  medicationId: Types.ObjectId;
  medicationName: string;
  genericName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  requiresPrescription: boolean;
}

export interface IOrderStatusHistory {
  status: string;
  actorId?: Types.ObjectId;
  note?: string | null;
  createdAt: Date;
}

export interface IOrder extends Document {
  orderId?: string;
  ref?: string;
  patientId: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  paymentId?: Types.ObjectId;
  deliveryAgentId?: Types.ObjectId | null;
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: {
    recipientName?: string;
    phone?: string;
    street?: string;
    subCity?: string;
    city?: string;
    additionalInfo?: string;
    coordinates?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  driverLocation?: {
    lat?: number;
    lng?: number;
    updatedAt?: Date;
  };
  deliveryInstructions?: string;
  prescriptionUploadId?: Types.ObjectId | null;
  prescriptionVerified: boolean;
  status: string;
  paymentMethod: 'chapa' | 'cod';
  paymentStatus: string;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  statusHistory: IOrderStatusHistory[];
  estimatedReadyAt?: Date;
  estimatedDeliveryAt?: Date;
  tripStartedAt?: Date | null;
  driverHandoffAt?: Date | null;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  patientId: Types.ObjectId;
  txRef: string;
  chapaReference?: string;
  checkoutUrl?: string;
  amount: number;
  currency: string;
  chapaCharge?: number;
  paymentMethod: string;
  status: string;
  chapaStatus?: string;
  mode?: string;
  webhookReceivedAt?: Date;
  verifiedAt?: Date;
  webhookPayload?: Record<string, unknown>;
  retryCount: number;
  lastRetryAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrescriptionUpload extends Document {
  patientId: Types.ObjectId;
  orderId?: Types.ObjectId;
  fileUrl: string;
  fileType: 'image' | 'pdf';
  verifiedById?: Types.ObjectId | null;
  verifiedAt?: Date | null;
  rejectedAt?: Date | null;
  rejectedReason?: string | null;
  rejectedById?: Types.ObjectId | null;
  uploadedAt: Date;
}

export interface IConversation extends Document {
  relatedOrderId?: Types.ObjectId;
  participants: Array<{ userId: Types.ObjectId; name: string; role: 'patient' | 'pharmacy' | 'delivery' }>;
  lastMessage?: { content: string; senderId: Types.ObjectId; sentAt: Date };
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderName: string;
  content: string;
  isRead: boolean;
  sentAt: Date;
  /** user = normal chat; system = automated intro (never from client POST) */
  kind?: 'user' | 'system';
}

export interface IReview extends Document {
  pharmacyId: Types.ObjectId;
  patientId: Types.ObjectId;
  patientName?: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface IHospital extends Document {
  name: string;
  address?: string;
  phone?: string;
  specialties: string[];
  coordinates: {
    type: 'Point';
    coordinates: number[];
  };
  isActive: boolean;
  createdAt: Date;
}

export interface IComplaint extends Document {
  ref: string;
  reporterId: Types.ObjectId;
  reporterName?: string;
  reporterRole: 'patient' | 'pharmacy';
  targetType: 'pharmacy' | 'system';
  targetId?: Types.ObjectId;
  targetName?: string;
  issue: string;
  details?: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved' | 'dismissed';
  resolvedById?: Types.ObjectId | null;
  resolvedAt?: Date | null;
  resolution?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHealthAlert extends Document {
  createdById: Types.ObjectId;
  type: 'Disease Outbreak' | 'Medication Recall' | 'Emergency Health Advisory';
  region: string;
  message: string;
  details?: string;
  youtubeLink?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface IPlatformConfig extends Document {
  value: string;
}

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

// Legacy interfaces retained for compatibility with unused modules
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

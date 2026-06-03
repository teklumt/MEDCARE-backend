export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: unknown;
  incremental?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export class ApiRequestError extends Error {
  readonly status: number;
  readonly details?: string;

  constructor(message: string, status: number, details?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const getToken = () => {
  if (typeof window === "undefined") return null;
  // Try admin token first (from Admin-Backend login), then fall back to medcare token
  return (
    localStorage.getItem("admin_access_token") ||
    localStorage.getItem("medcare_access_token")
  );
};

const buildUrl = (
  path: string,
  params?: Record<string, string | number | undefined>,
) => {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, string | number | undefined>,
): Promise<ApiResponse<T>> => {
  const token = getToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, params), {
    ...options,
    headers,
  });

  let data: ApiResponse<T>;
  try {
    data = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiRequestError("Invalid server response", response.status);
  }

  if (!response.ok || data.success === false) {
    const detail =
      typeof data.details === "string"
        ? data.details
        : data.details != null && typeof data.details === "object"
          ? JSON.stringify(data.details)
          : undefined;
    throw new ApiRequestError(
      data.error || data.message || "Request failed",
      response.status,
      detail,
    );
  }

  return data;
};

export const apiGet = async <T>(
  path: string,
  params?: Record<string, string | number | undefined>,
) => apiRequest<T>(path, { method: "GET" }, params);

export const apiPost = async <T>(path: string, body?: any) =>
  apiRequest<T>(path, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body || {}),
  });

export const apiPatch = async <T>(path: string, body?: any) =>
  apiRequest<T>(path, {
    method: "PATCH",
    body: body instanceof FormData ? body : JSON.stringify(body || {}),
  });

export const apiPut = async <T>(path: string, body?: any) =>
  apiRequest<T>(path, {
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body || {}),
  });

export const apiDelete = async <T>(path: string) =>
  apiRequest<T>(path, { method: "DELETE" });

// --- User addresses ---

export type UserAddress = {
  _id?: string;
  label?: string;
  recipientName?: string;
  phone?: string;
  street?: string;
  subCity?: string;
  city?: string;
  additionalInfo?: string;
  isDefault?: boolean;
  coordinates?: { type: "Point"; coordinates: [number, number] };
};

export type DeliveryAddressPayload = {
  recipientName?: string;
  phone?: string;
  street?: string;
  subCity?: string;
  city?: string;
  additionalInfo?: string;
  coordinates?: { type: "Point"; coordinates: [number, number] };
};

export const getUserAddresses = async (): Promise<UserAddress[]> => {
  const res = await apiGet<UserAddress[]>("/users/me/addresses");
  return res.data ?? [];
};

export const addUserAddress = async (
  address: UserAddress,
): Promise<UserAddress[]> => {
  const res = await apiPost<UserAddress[]>("/users/me/addresses", address);
  return res.data ?? [];
};

export const updateUserAddress = async (
  id: string,
  address: Partial<UserAddress>,
): Promise<UserAddress[]> => {
  const res = await apiPut<UserAddress[]>(`/users/me/addresses/${id}`, address);
  return res.data ?? [];
};

export type ChangeMyPasswordBody = {
  currentPassword: string;
  newPassword: string;
};

/** Authenticated user — updates password after verifying current password (MedCare pharmacy backend). */
export const changeMyPassword = async (
  body: ChangeMyPasswordBody,
): Promise<void> => {
  await apiPut<{ message?: string }>("/users/me/password", body);
};

// --- Pharmacies ---

export type PharmacyListItem = {
  _id: string;
  businessName: string;
  location?: string;
  address?: string;
  phone?: string;
  description?: string;
  openingHours?: string;
  isOpen?: boolean;
  deliveryAvailable?: boolean;
  coordinates?: { type?: string; coordinates?: number[] };
  stats?: { rating?: number; reviewCount?: number };
};

export type PharmacyMedicationItem = {
  _id: string;
  name: string;
  genericName?: string;
  category?: string;
  price: number;
  requiresPrescription?: boolean;
  imageUrl?: string;
  stockQuantity?: number;
};

export const listPharmacies = async (params?: {
  lat?: number;
  lng?: number;
  search?: string;
}): Promise<PharmacyListItem[]> => {
  const res = await apiGet<PharmacyListItem[]>("/pharmacies", params);
  return res.data ?? [];
};

export const getPharmacyById = async (
  id: string,
): Promise<PharmacyListItem> => {
  const res = await apiGet<PharmacyListItem>(`/pharmacies/${id}`);
  if (!res.data) throw new Error("Pharmacy not found");
  return res.data;
};

export type MyPharmacyProfile = PharmacyListItem & {
  email?: string;
  deliveryFee?: number;
  deliveryRadiusKm?: number;
};

export type UpdateMyPharmacyPayload = {
  location?: string;
  address?: string;
  openingHours?: string;
  isOpen?: boolean;
  coordinates?: {
    type: "Point";
    coordinates: [number, number];
  };
  deliveryRadiusKm?: number;
  deliveryFee?: number;
  deliveryAvailable?: boolean;
};

export const getMyPharmacy = async (): Promise<MyPharmacyProfile> => {
  const res = await apiGet<MyPharmacyProfile>("/pharmacy/me");
  if (!res.data) throw new Error("Pharmacy not found");
  return res.data;
};

/** Authenticated pharmacy owner — reviews for their pharmacy (same shape as public pharmacy reviews). */
export const getMyPharmacyReviews = async (): Promise<PharmacyReviewItem[]> => {
  const res = await apiGet<PharmacyReviewItem[]>("/pharmacy/me/reviews");
  return res.data ?? [];
};

export type PharmacyAnalytics = {
  period: string;
  orderCount: number;
  revenue: number;
  prevOrderCount: number;
  prevRevenue: number;
};

/** Real revenue + order count analytics for the authenticated pharmacy owner. */
export const getPharmacyAnalytics = async (period: '7d' | '30d' | '90d' = '30d'): Promise<PharmacyAnalytics> => {
  const res = await apiGet<PharmacyAnalytics>(`/pharmacy/me/analytics?period=${period}`);
  if (!res.data) throw new Error("Pharmacy analytics not found");
  return res.data;
};

export const updateMyPharmacy = async (
  payload: UpdateMyPharmacyPayload,
): Promise<MyPharmacyProfile> => {
  const res = await apiPut<MyPharmacyProfile>("/pharmacy/me", payload);
  if (!res.data)
    throw new Error(res.error || res.message || "Failed to update pharmacy");
  return res.data;
};

export const getPharmacyInventory = async (
  pharmacyId: string,
  params?: { search?: string; page?: number },
): Promise<PharmacyMedicationItem[]> => {
  const res = await apiGet<
    { items?: PharmacyMedicationItem[] } | PharmacyMedicationItem[]
  >(`/pharmacies/${pharmacyId}/inventory`, params);
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (
    data &&
    Array.isArray((data as { items?: PharmacyMedicationItem[] }).items)
  ) {
    return (data as { items: PharmacyMedicationItem[] }).items;
  }
  return [];
};

export type PharmacyReviewItem = {
  _id: string;
  pharmacyId?: string;
  patientId?: string;
  patientName?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
};

export type PharmacyReviewsResult = {
  items: PharmacyReviewItem[];
  pagination: NonNullable<ApiResponse<unknown>["pagination"]>;
};

export const getPharmacyReviews = async (
  pharmacyId: string,
  params?: { page?: number },
): Promise<PharmacyReviewsResult> => {
  const res = await apiGet<PharmacyReviewItem[] | PharmacyReviewItem>(
    `/pharmacies/${pharmacyId}/reviews`,
    params,
  );
  const raw = res.data;
  const items: PharmacyReviewItem[] = Array.isArray(raw)
    ? raw.map((row) => ({
        ...row,
        _id:
          typeof row._id === "string"
            ? row._id
            : row._id != null
              ? String(row._id)
              : "",
        rating: Number(row.rating) || 0,
      }))
    : raw && typeof raw === "object" && "_id" in raw
      ? [
          {
            ...(raw as PharmacyReviewItem),
            _id:
              typeof (raw as PharmacyReviewItem)._id === "string"
                ? (raw as PharmacyReviewItem)._id
                : String((raw as { _id?: unknown })._id ?? ""),
            rating: Number((raw as PharmacyReviewItem).rating) || 0,
          },
        ]
      : [];
  return {
    items,
    pagination: res.pagination ?? {
      page: 1,
      limit: 20,
      total: items.length,
      pages: items.length ? 1 : 0,
    },
  };
};

export type SubmitPharmacyReviewBody = {
  rating: number;
  comment?: string;
  patientName?: string;
};

export const submitPharmacyReview = async (
  pharmacyId: string,
  body: SubmitPharmacyReviewBody,
): Promise<PharmacyReviewItem> => {
  const res = await apiPost<PharmacyReviewItem>(
    `/pharmacies/${pharmacyId}/reviews`,
    body,
  );
  if (!res.data)
    throw new ApiRequestError("Review submission returned no data", 500);
  return res.data;
};

export type ComplaintRecord = {
  _id: string;
  ref?: string;
  reporterId: string;
  reporterName?: string;
  reporterRole?: "patient" | "pharmacy";
  targetType: "pharmacy" | "system";
  targetId?: string;
  targetName?: string;
  issue: string;
  details?: string;
  severity: string;
  status: "open" | "resolved" | "dismissed";
  createdAt?: string;
};

export type SubmitComplaintBody = {
  issue: string;
  details?: string;
  severity?: "low" | "medium" | "high";
  targetType: "pharmacy" | "system";
  targetId?: string;
  targetName?: string;
};

export const submitComplaint = async (
  body: SubmitComplaintBody,
): Promise<ComplaintRecord> => {
  const res = await apiPost<ComplaintRecord>("/complaints", body);
  if (!res.data)
    throw new Error(res.error || res.message || "Failed to submit complaint");
  return res.data;
};

export const getMyComplaints = async (): Promise<ComplaintRecord[]> => {
  const res = await apiGet<ComplaintRecord[]>("/complaints/me");
  return res.data ?? [];
};

/** Drivers linked to this pharmacy via deliveryagents + users (pharmacy portal). */
export type PharmacyDeliveryAgent = {
  id: string;
  username?: string;
  phone?: string;
  email?: string;
  vehicleType?: string;
  licensePlate?: string;
  isOnline?: boolean;
};

export const getMyDeliveryAgents = async (): Promise<
  PharmacyDeliveryAgent[]
> => {
  const res = await apiGet<PharmacyDeliveryAgent[]>(
    "/pharmacy/me/delivery-agents",
  );
  return res.data ?? [];
};

/** Populated pharmacy on driver assignment response. */
export type DeliveryAssignmentPharmacy = {
  _id?: string;
  businessName?: string;
  address?: string;
  location?: string;
  phone?: string;
  coordinates?: { type?: string; coordinates?: number[] };
};

export type DeliveryAssignedOrderItem = {
  medicationName: string;
  quantity: number;
};

export type DeliveryAssignedOrder = {
  _id: string;
  ref?: string;
  orderId?: string;
  pharmacyId?: string | DeliveryAssignmentPharmacy;
  deliveryAddress?: DeliveryAddressPayload;
  deliveryInstructions?: string;
  items: DeliveryAssignedOrderItem[];
  paymentMethod: "chapa" | "cod";
  totalAmount: number;
  tripStartedAt?: string | null;
  driverHandoffAt?: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string;
};

/** Driver online flag (synced with pharmacy assign-delivery list). */
export const getMyDeliveryOnlineStatus = async (): Promise<boolean> => {
  const res = await apiGet<{ isOnline: boolean }>("/delivery/me/status");
  return Boolean(res.data?.isOnline);
};

export const setMyDeliveryOnlineStatus = async (
  isOnline: boolean,
): Promise<boolean> => {
  const res = await apiPatch<{ isOnline: boolean }>("/delivery/me/status", {
    isOnline,
  });
  if (!res.success) {
    throw new Error(
      res.error || res.message || "Failed to update online status",
    );
  }
  return Boolean(res.data?.isOnline);
};

/** Dispatched orders assigned to the logged-in delivery agent. */
export const getMyDeliveryOrders = async (): Promise<
  DeliveryAssignedOrder[]
> => {
  const res = await apiGet<DeliveryAssignedOrder[]>("/delivery/me/orders");
  return res.data ?? [];
};

export const startDeliveryTrip = async (
  orderMongoId: string,
): Promise<DeliveryAssignedOrder> => {
  const res = await apiPatch<DeliveryAssignedOrder>(
    `/delivery/orders/${orderMongoId}/start-trip`,
    {},
  );
  if (!res.data) throw new Error("No order returned");
  return res.data;
};

export const confirmDriverHandoff = async (
  orderMongoId: string,
): Promise<DeliveryAssignedOrder> => {
  const res = await apiPatch<DeliveryAssignedOrder>(
    `/delivery/orders/${orderMongoId}/confirm-handoff`,
    {},
  );
  if (!res.data) throw new Error("No order returned");
  return res.data;
};

/** Completed delivery rows for driver history / earnings (from GET /delivery/me/history|earnings). */
export type DeliveryHistoryPharmacy = {
  _id?: string;
  businessName?: string;
  address?: string;
};

export type DeliveryHistoryOrder = {
  _id: string;
  ref?: string;
  orderId?: string;
  status: string;
  paymentMethod?: string;
  deliveryFee?: number;
  deliveryAddress?: DeliveryAssignedOrder["deliveryAddress"];
  tripStartedAt?: string | null;
  driverHandoffAt?: string | null;
  deliveredAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  completionAt?: string;
  pharmacyId?: DeliveryHistoryPharmacy;
};

export type DeliveryHistoryResponse = {
  orders: DeliveryHistoryOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type DeliveryEarningsResponse = {
  thisWeek: number;
  thisMonth: number;
  allTime: number;
  recent: DeliveryHistoryOrder[];
};

export type DeliveryHistoryPeriod = "today" | "week" | "month" | "all";

export const getMyDeliveryHistory = async (params?: {
  period?: DeliveryHistoryPeriod;
  page?: number;
  limit?: number;
}): Promise<DeliveryHistoryResponse> => {
  const res = await apiGet<DeliveryHistoryResponse>("/delivery/me/history", {
    period: params?.period ?? "all",
    page: params?.page,
    limit: params?.limit,
  });
  if (!res.data)
    throw new Error(
      res.error || res.message || "Failed to load delivery history",
    );
  return res.data;
};

export const getMyDeliveryEarnings =
  async (): Promise<DeliveryEarningsResponse> => {
    const res = await apiGet<DeliveryEarningsResponse>("/delivery/me/earnings");
    if (!res.data)
      throw new Error(res.error || res.message || "Failed to load earnings");
    return res.data;
  };

/** Driver profile fields from GET /delivery/me/profile (same JWT as other delivery endpoints). */
export type DeliveryMeProfile = {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  nationalId?: string;
  vehicleType: string;
  licensePlate?: string;
  pharmacyName?: string;
  pharmacyAddress?: string;
  profilePhotoUrl?: string;
};

export const getDeliveryMeProfile = async (): Promise<DeliveryMeProfile> => {
  const res = await apiGet<DeliveryMeProfile>("/delivery/me/profile");
  if (!res.data)
    throw new ApiRequestError(
      res.error || res.message || "Profile unavailable",
      500,
    );
  return res.data;
};

export type BulkInventoryUploadResult = {
  total: number;
  succeeded: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
};

/** CSV bulk import for pharmacy inventory (field name `file`). */
export const bulkUploadPharmacyInventoryApi = async (
  file: File,
): Promise<BulkInventoryUploadResult> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiPost<BulkInventoryUploadResult>(
    "/pharmacy/me/inventory/bulk-upload",
    formData,
  );
  if (!res.data) {
    throw new ApiRequestError(
      res.error || res.message || "Bulk upload failed",
      500,
    );
  }
  return res.data;
};

/** Multipart upload; field name `file` — returns persisted medication image URL. */
export const uploadPharmacyMedicationImageApi = async (
  file: File,
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiPost<{ imageUrl: string }>(
    "/pharmacy/me/inventory/image-upload",
    formData,
  );
  const url = res.data?.imageUrl;
  if (!url || typeof url !== "string") {
    throw new ApiRequestError(
      "Upload succeeded but no image URL returned",
      500,
    );
  }
  return url;
};

/** Multipart upload; field name `file` — returns persisted image URL (Cloudinary or local). */
export const uploadDeliveryProfilePhotoApi = async (
  file: File,
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiPost<{ profilePhotoUrl: string }>(
    "/delivery/me/profile-photo",
    formData,
  );
  const url = res.data?.profilePhotoUrl;
  if (!url || typeof url !== "string") {
    throw new ApiRequestError(
      "Upload succeeded but no image URL returned",
      500,
    );
  }
  return url;
};

/** Clears `profilePhotoUrl` on the user document server-side. */
export const deleteDeliveryProfilePhotoApi = async (): Promise<void> => {
  await apiDelete<{ profilePhotoUrl: null }>("/delivery/me/profile-photo");
};

/** Patient confirms home delivery receipt (after driver handoff). */
export const confirmOrderReceipt = async (
  orderMongoId: string,
): Promise<OrderDetail> => {
  const res = await apiPatch<OrderDetail>(
    `/orders/${orderMongoId}/confirm-receipt`,
    {},
  );
  if (!res.data) throw new Error("No order returned");
  return res.data;
};

/** Order document fields needed for patient tracking (from GET /orders/:id). */
export type OrderDetail = {
  _id: string;
  ref?: string;
  orderId?: string;
  status: string;
  deliveryMethod: "pickup" | "delivery";
  deliveryAgentId?: string | null;
  tripStartedAt?: string | null;
  driverHandoffAt?: string | null;
  deliveredAt?: string | null;
  totalAmount: number;
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  paymentMethod: string;
  paymentStatus: string;
  prescriptionVerified?: boolean;
  prescriptionUploadId?: string | null;
  deliveryAddress?: DeliveryAddressPayload;
  deliveryInstructions?: string;
  items: Array<{
    medicationName: string;
    quantity: number;
    unitPrice?: number;
    subtotal?: number;
  }>;
  createdAt: string;
  pharmacyId?: unknown;
  driverLocation?: { lat?: number; lng?: number; updatedAt?: string } | null;
};

export type OrderTrackingData = {
  status: string;
  tripStartedAt?: string | null;
  driverHandoffAt?: string | null;
  deliveryAddress?: DeliveryAddressPayload | null;
  pharmacy?: {
    _id?: string;
    businessName?: string;
    address?: string;
    location?: string;
    coordinates?: { type?: string; coordinates?: number[] };
  } | null;
  driverLocation?: { lat?: number; lng?: number; updatedAt?: string } | null;
};

export const getOrderTracking = async (
  orderId: string,
): Promise<OrderTrackingData> => {
  const res = await apiGet<OrderTrackingData>(`/orders/${orderId}/tracking`);
  if (!res.data) throw new Error("Tracking not available");
  return res.data;
};

export const updateDriverLocation = async (
  lat: number,
  lng: number,
): Promise<void> => {
  await apiPatch("/delivery/me/location", { lat, lng });
};

export const getOrderById = async (orderId: string): Promise<OrderDetail> => {
  const res = await apiGet<OrderDetail>(`/orders/${orderId}`);
  if (!res.data) throw new Error("Order not found");
  return res.data;
};

export type PrescriptionUploadDetail = {
  _id: string;
  patientId?: string;
  orderId?: string | null;
  fileUrl: string;
  fileType: string;
};

export type ParsedPrescriptionFields = {
  is_valid_prescription?: boolean;
  doctor_name?: string | null;
  doctor_specialty?: string | null;
  clinic_name?: string | null;
  patient_name?: string | null;
  date?: string | null;
  diagnosis?: string | null;
  refills?: string | null;
};

export type ScanPrescriptionData = {
  medicines: string[];
  medicine_count: number;
  parsed_prescription: ParsedPrescriptionFields | null;
};

/** Patient OCR scan; backend proxies to PRESCRIPTION_SCAN_WEBHOOK_URL. */
export const scanPrescription = async (
  file: File,
): Promise<ScanPrescriptionData> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiPost<ScanPrescriptionData>(
    "/prescriptions/scan",
    formData,
  );
  if (!res.data)
    throw new Error(res.error || res.message || "Prescription scan failed");
  return res.data;
};

/** Rx deferral path: POST /orders with deferRxReview (patient). */
export const submitOrderForPrescriptionReview = async (
  payload: Record<string, unknown>,
): Promise<{
  order: OrderDetail & { _id?: string };
  payment: unknown | null;
}> => {
  const res = await apiPost<{
    order: OrderDetail & { _id?: string };
    payment: unknown | null;
  }>("/orders", {
    ...payload,
    deferRxReview: true,
  });
  if (!res.data?.order) throw new Error("Failed to submit order");
  return res.data;
};

/** After pharmacy verifies Rx (patient). */
export const completeOrderPayment = async (
  orderMongoId: string,
): Promise<{ order: OrderDetail; payment?: unknown; checkoutUrl?: string }> => {
  const res = await apiPost<{
    order: OrderDetail;
    payment?: unknown;
    checkoutUrl?: string;
  }>(`/orders/${orderMongoId}/complete-payment`, {});
  if (!res.data?.order) throw new Error("Could not start payment");
  return res.data;
};

export const getPrescriptionUpload = async (
  id: string,
): Promise<PrescriptionUploadDetail> => {
  const res = await apiGet<PrescriptionUploadDetail>(`/prescriptions/${id}`);
  if (!res.data) throw new Error("Prescription not found");
  return res.data;
};

export const verifyPrescriptionUpload = async (id: string): Promise<void> => {
  await apiPatch(`/pharmacy/prescriptions/${id}/verify`, {});
};

export const rejectPrescriptionUpload = async (
  id: string,
  note?: string,
): Promise<void> => {
  await apiPatch(`/pharmacy/prescriptions/${id}/reject`, { note });
};

// --- MedCare AI (webhook proxy) ---

export type MedcareAiPrescriptionPayload = {
  detected?: boolean;
  doctor?: string | null;
  clinic?: string | null;
  medications?: unknown[];
  ocr_model?: string | null;
  page_count?: number;
};

export type MedcareAiChatResponseData = {
  status?: string;
  session_id?: string | number;
  timestamp?: string;
  user?: unknown;
  message?: { text?: string; language?: string };
  prescription?: MedcareAiPrescriptionPayload;
};

/** POST /medcare-ai/chat — proxied to MEDCARE_AI_WEBHOOK_URL on the backend. */
export const sendMedcareAiChat = async (payload: {
  content: string;
  conversationId?: string | null;
}): Promise<MedcareAiChatResponseData> => {
  const body: Record<string, string> = { content: payload.content };
  if (
    payload.conversationId != null &&
    String(payload.conversationId).trim() !== ""
  ) {
    body.conversationId = String(payload.conversationId).trim();
  }
  const res = await apiPost<MedcareAiChatResponseData>(
    "/medcare-ai/chat",
    body,
  );
  if (!res.data)
    throw new Error(res.error || res.message || "MedCare AI request failed");
  return res.data;
};

// --- Conversations / messaging (REST + polling) ---

export type ConversationParticipant = {
  userId: string;
  name: string;
  role: "patient" | "pharmacy" | "delivery";
};

export type ConversationListItem = {
  _id: string;
  relatedOrderId?: string | null;
  participants: ConversationParticipant[];
  lastMessage?: {
    content?: string;
    senderId?: string;
    sentAt?: string;
  };
  updatedAt?: string;
  createdAt?: string;
};

export type ConversationMessage = {
  _id: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  isRead?: boolean;
  kind?: "user" | "system";
  senderRole?: "patient" | "pharmacy" | "delivery" | "system";
};

export type CreateConversationPayload = {
  participantId: string;
  orderId?: string | null;
};

export const listConversations = async (): Promise<ConversationListItem[]> => {
  const res = await apiGet<ConversationListItem[]>("/conversations");
  return res.data ?? [];
};

export const createConversation = async (
  payload: CreateConversationPayload,
): Promise<ConversationListItem> => {
  const res = await apiPost<ConversationListItem>("/conversations", payload);
  if (!res.data) throw new Error("Could not create conversation");
  return res.data;
};

export const getConversationMessages = async (
  conversationId: string,
  params?: { page?: number; since?: string },
): Promise<{
  messages: ConversationMessage[];
  incremental: boolean;
  pagination?: ApiResponse<ConversationMessage[]>["pagination"];
}> => {
  const res = await apiRequest<ConversationMessage[]>(
    `/conversations/${conversationId}/messages`,
    { method: "GET" },
    params as Record<string, string | number | undefined>,
  );
  return {
    messages: res.data ?? [],
    incremental: Boolean(res.incremental),
    pagination: res.pagination,
  };
};

export const sendConversationMessage = async (
  conversationId: string,
  content: string,
): Promise<ConversationMessage> => {
  const res = await apiPost<ConversationMessage>(
    `/conversations/${conversationId}/messages`,
    { content },
  );
  if (!res.data) throw new Error("Failed to send message");
  return res.data;
};

export const markConversationRead = async (
  conversationId: string,
): Promise<void> => {
  await apiPatch(`/conversations/${conversationId}/read`, {});
};

// --- Pharmacy platform commission (flat ETB per delivered order, Chapa settlement) ---

export type PharmacyCommissionSummary = {
  outstandingDebtEtb: number;
  accruedThisMonthEtb: number;
};

export type CommissionChapaInitResponse = {
  checkoutUrl?: string;
  txRef: string;
  commissionPaymentId: string;
};

export const getPharmacyCommissionSummary =
  async (): Promise<PharmacyCommissionSummary> => {
    const res = await apiGet<PharmacyCommissionSummary>("/commission/summary");
    if (!res.data) throw new Error("Could not load commission summary");
    return res.data;
  };

export const initiateCommissionChapaPayment = async (body?: {
  amount?: number;
}): Promise<CommissionChapaInitResponse> => {
  const res = await apiPost<CommissionChapaInitResponse>(
    "/commission/chapa/initiate",
    body ?? {},
  );
  if (!res.data) throw new Error("Could not start commission payment");
  return res.data;
};

// --- Stored notifications (Med API; same JWT as other /api/v1 calls) ---

export type StoredNotification = {
  _id: string;
  recipientId: string;
  category: "order" | "complaint";
  event: string;
  title: string;
  body: string;
  entityType: "order" | "complaint";
  entityId: string;
  readAt: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type NotificationsListPayload = {
  notifications: StoredNotification[];
  unreadCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
  total: number;
};

export const listMedNotifications = async (
  page = 1,
  limit = 7,
): Promise<NotificationsListPayload> => {
  const res = await apiGet<NotificationsListPayload>("/notifications", {
    page,
    limit,
  });
  if (!res.data) throw new Error("Could not load notifications");
  return res.data;
};

export const markMedNotificationsRead = async (
  ids: string[],
): Promise<void> => {
  await apiPatch("/notifications/read", { ids });
};

export const markAllMedNotificationsRead = async (): Promise<void> => {
  await apiPatch("/notifications/read", { all: true });
};

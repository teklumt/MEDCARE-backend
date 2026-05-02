# MED-CARE Ethiopia — Full Platform Schema

> Stack: Node + express  backend · MongoDB · Chapa payments · Next.js frontend

---

## MongoDB Collections

### `users`
```js
{
  _id: ObjectId(), ref: "USR-001",
  username: "abebe_kebede", email: "abebe@example.com",
  phone: "+251911234567", passwordHash: "$2b$12$...",
  role: "patient",          // patient | pharmacy | delivery | admin
  language: "en",           // en | am
  isActive: true, isLocked: false,
  lockExpiresAt: null, failedLoginAttempts: 0,
  mfa: { enabled: false, secret: null, backupCodes: [] },
  addresses: [{             // EMBEDDED — bounded, always loaded with profile
    _id: ObjectId(), label: "Home",
    recipientName: "Abebe Kebede", phone: "0911234567",
    street: "Bole Road, Dembel", subCity: "Bole",
    city: "Addis Ababa", additionalInfo: "Green gate", isDefault: true
  }],
  createdAt: ISODate(), updatedAt: ISODate()
}
```
```js
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
```

---

### `otps`
```js
{
  _id: ObjectId(), userId: ObjectId(),
  codeHash: "$2b$12$...",
  purpose: "password_reset",  // password_reset | phone_verify
  expiresAt: ISODate(), used: false, createdAt: ISODate()
}
```
```js
db.otps.createIndex({ userId: 1 })
db.otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL auto-delete
```

---

### `pharmacies`
```js
{
  _id: ObjectId(), ref: "PHR-001",
  ownerId: ObjectId(),
  businessName: "Kenema Pharmacy #4",
  location: "Bole, Addis Ababa", address: "Bole Road, near Dembel",
  coordinates: { type: "Point", coordinates: [38.7969, 9.0084] },
  phone: "+251115511211", email: "kenema@example.com",
  description: "...", openingHours: "Open 24 Hours",
  deliveryAvailable: true, deliveryFee: 50.00,
  license: {
    businessLicenseNumber: "EFDA-LIC-2024-8891",
    businessLicenseExpiry: ISODate(),
    professionalLicenseExpiry: ISODate()
  },
  verification: {           // EMBEDDED — always shown with profile
    status: "approved",     // pending | reviewing | approved | rejected | needs_docs
    verifiedAt: ISODate(), verifiedById: ObjectId(), rejectionNote: null,
    documents: {
      businessRegistration:  { url: "https://s3.../file.pdf", status: "verified", uploadedAt: ISODate() },
      operatingLicense:      { url: "https://s3.../lic.pdf",  status: "verified", uploadedAt: ISODate() },
      inspectionReport:      { url: "https://s3.../rep.pdf",  status: "verified", uploadedAt: ISODate() }
    }
  },
  stats: { rating: 4.8, reviewCount: 1245 },
  isActive: true, isOpen: true,
  createdAt: ISODate(), updatedAt: ISODate()
}
```
```js
db.pharmacies.createIndex({ coordinates: "2dsphere" })
db.pharmacies.createIndex({ "verification.status": 1 })
db.pharmacies.createIndex({ ownerId: 1 })
db.pharmacies.createIndex({ businessName: "text" })
```

---

### `delivery_agents`
```js
{
  _id: ObjectId(),          // same _id as users._id
  pharmacyId: ObjectId(),
  vehicleType: "motorcycle",  // bicycle | motorcycle | car
  isOnline: true,
  stats: {
    totalDelivered: 47,
    earnings: { today: 120.00, thisWeek: 840.00, thisMonth: 3200.00 }
  },
  createdAt: ISODate(), updatedAt: ISODate()
}
```

---

### `medications`
```js
{
  _id: ObjectId(), ref: "MED-0041",
  pharmacyId: ObjectId(),
  name: "Amoxil", genericName: "Amoxicillin",
  category: "Antibiotics", dosageForm: "Capsule",
  strength: "500mg", manufacturer: "GSK",
  batchNumber: "BN-20250101", expiryDate: ISODate(),
  price: 200.00, stockQuantity: 150, lowStockThreshold: 20,
  stockStatus: "adequate",  // adequate | low_stock | out_of_stock
  requiresPrescription: true, imageUrl: "https://s3.../amoxil.jpg",
  description: "...", isActive: true,
  createdAt: ISODate(), updatedAt: ISODate()
}
```
```js
db.medications.createIndex({ pharmacyId: 1, stockStatus: 1 })
db.medications.createIndex({ pharmacyId: 1, category: 1 })
db.medications.createIndex({ name: "text", genericName: "text" })
db.medications.createIndex({ expiryDate: 1 })
```

---

### `orders`
```js
{
  _id: ObjectId(), ref: "ORD-48821",
  patientId: ObjectId(), pharmacyId: ObjectId(),
  deliveryAgentId: null, paymentId: ObjectId(),
  deliveryMethod: "delivery",     // pickup | delivery
  deliveryAddress: {              // SNAPSHOT at order time
    recipientName: "Abebe Kebele", phone: "0911234567",
    street: "Bole Road, Dembel", subCity: "Bole",
    city: "Addis Ababa", additionalInfo: "Green gate"
  },
  deliveryInstructions: "Call on arrival",
  prescriptionUploadId: null, prescriptionVerified: false,
  status: "confirmed",
  // pending|confirmed|preparing|ready|dispatched|delivered|cancelled|rejected
  paymentMethod: "chapa",         // chapa | cod
  paymentStatus: "success",
  // pending|initiated|success|failed|refunded|reversed|cod_pending|cod_collected
  items: [                        // EMBEDDED — always accessed with order
    { _id: ObjectId(), medicationId: ObjectId(),
      medicationName: "Amoxil", genericName: "Amoxicillin",
      quantity: 2, unitPrice: 200.00, subtotal: 400.00, requiresPrescription: true },
    { _id: ObjectId(), medicationId: ObjectId(),
      medicationName: "Tylenol", genericName: "Acetaminophen",
      quantity: 1, unitPrice: 150.00, subtotal: 150.00, requiresPrescription: false }
  ],
  subtotal: 550.00, deliveryFee: 50.00, discount: 0.00, totalAmount: 600.00,
  statusHistory: [                // EMBEDDED — bounded ~8 events
    { status: "pending",   actorId: ObjectId(), note: null, createdAt: ISODate() },
    { status: "confirmed", actorId: ObjectId(), note: "Accepted", createdAt: ISODate() }
  ],
  estimatedReadyAt: ISODate(), estimatedDeliveryAt: ISODate(), deliveredAt: null,
  createdAt: ISODate(), updatedAt: ISODate()
}
```
```js
db.orders.createIndex({ ref: 1 }, { unique: true })
db.orders.createIndex({ patientId: 1, createdAt: -1 })
db.orders.createIndex({ pharmacyId: 1, status: 1 })
db.orders.createIndex({ deliveryAgentId: 1, status: 1 })
db.orders.createIndex({ paymentId: 1 })
db.orders.createIndex({ status: 1, createdAt: -1 })
```

---

### `payments`
```js
{
  _id: ObjectId(),
  orderId: ObjectId(), patientId: ObjectId(),
  txRef: "medcare-ORD-48821-1746203460",  // UNIQUE — your generated key
  chapaReference: "APqDvYw1okk2",          // Chapa's ref_id
  checkoutUrl: "https://checkout.chapa.co/...",
  amount: 600.00, currency: "ETB", chapaCharge: 18.00,
  paymentMethod: "telebirr",  // telebirr|cbe_birr|mpesa|ebirr|chapa|cod
  status: "success",          // initiated|pending|success|failed|refunded|reversed|cod_pending|cod_collected
  chapaStatus: "success", mode: "live",
  webhookReceivedAt: ISODate(), verifiedAt: ISODate(),
  webhookPayload: {           // full raw Chapa webhook body — stored for audit
    event: "charge.success", tx_ref: "medcare-ORD-48821-1746203460",
    reference: "APqDvYw1okk2", amount: "600.00", currency: "ETB",
    status: "success", mode: "live", payment_method: "telebirr",
    mobile: "251911234567"
  },
  retryCount: 0, lastRetryAt: null,
  createdAt: ISODate(), updatedAt: ISODate()
}
```
```js
db.payments.createIndex({ txRef: 1 }, { unique: true })
db.payments.createIndex({ orderId: 1 }, { unique: true })
db.payments.createIndex({ patientId: 1, createdAt: -1 })
db.payments.createIndex({ status: 1 })
```

---

### `prescription_uploads`
```js
{
  _id: ObjectId(),
  patientId: ObjectId(), orderId: ObjectId(),
  fileUrl: "https://s3.../rx-abc.jpg",
  fileType: "image",          // image | pdf
  verifiedById: null, verifiedAt: null,
  uploadedAt: ISODate()
}
```

---

### `delivery_assignments`
```js
{
  _id: ObjectId(), ref: "DEL-20847",
  orderId: ObjectId(), agentId: ObjectId(), pharmacyId: ObjectId(),
  snapshot: {                 // EMBEDDED — agent needs all data, no joins
    pharmacyName: "Kenema Pharmacy #4",
    pharmacyAddress: "Bole Road, near Dembel",
    patientName: "Abebe Kebede", patientPhone: "0911234567",
    patientAddress: "Bole Road, Dembel City Center", patientArea: "Bole",
    deliveryInstructions: "Call when arriving",
    distanceText: "~2.3 km",
    medications: ["Amoxil x2", "Tylenol x1"]
  },
  paymentMethod: "cod", codAmount: 600.00,
  status: "in_progress",  // new_assignment | in_progress | completed | declined
  activeStep: 2,          // 1=Go to pharmacy 2=Pickup 3=Deliver 4=Confirm
  declineReason: null, photoProofUrl: null, cashCollected: null,
  assignedAt: ISODate(), completedAt: null, updatedAt: ISODate()
}
```
```js
db.delivery_assignments.createIndex({ orderId: 1 }, { unique: true })
db.delivery_assignments.createIndex({ agentId: 1, status: 1 })
db.delivery_assignments.createIndex({ pharmacyId: 1, status: 1 })
```

---

### `delivery_earnings`
```js
{
  _id: ObjectId(),
  agentId: ObjectId(), assignmentId: ObjectId(), orderId: ObjectId(),
  amount: 25.00, earnedAt: ISODate()
}
```
```js
db.delivery_earnings.createIndex({ agentId: 1, earnedAt: -1 })
```

---

### `conversations`
```js
{
  _id: ObjectId(), relatedOrderId: ObjectId(),
  participants: [
    { userId: ObjectId(), name: "Abebe Kebede",    role: "patient"  },
    { userId: ObjectId(), name: "Kenema Pharmacy", role: "pharmacy" }
  ],
  lastMessage: {              // EMBEDDED preview — avoids fetching messages for inbox
    content: "Your order is ready.", senderId: ObjectId(), sentAt: ISODate()
  },
  createdAt: ISODate(), updatedAt: ISODate()
}
```
```js
db.conversations.createIndex({ "participants.userId": 1 })
db.conversations.createIndex({ updatedAt: -1 })
```

---

### `messages`
```js
{
  _id: ObjectId(), conversationId: ObjectId(),
  senderId: ObjectId(), senderName: "Kenema Pharmacy",
  content: "Your order is ready for pickup.",
  isRead: false, sentAt: ISODate()
}
```
```js
db.messages.createIndex({ conversationId: 1, sentAt: 1 })
```

---

### `reviews`
```js
{
  _id: ObjectId(), pharmacyId: ObjectId(), patientId: ObjectId(),
  patientName: "Abebe Kebede",
  rating: 5, comment: "Fast service!", createdAt: ISODate()
}
```
```js
db.reviews.createIndex({ pharmacyId: 1, patientId: 1 }, { unique: true })
db.reviews.createIndex({ pharmacyId: 1, createdAt: -1 })
```

---

### `hospitals`
```js
{
  _id: ObjectId(), name: "Black Lion Hospital",
  address: "Lideta, Addis Ababa", phone: "+251111239814",
  specialties: ["Cardiology", "Emergency"],
  coordinates: { type: "Point", coordinates: [38.7577, 9.0284] },
  isActive: true, createdAt: ISODate()
}
```
```js
db.hospitals.createIndex({ coordinates: "2dsphere" })
db.hospitals.createIndex({ name: "text" })
```

---

### `complaints`
```js
{
  _id: ObjectId(), ref: "CMP-892",
  reporterId: ObjectId(), reporterName: "Abebe Kebede",
  targetType: "pharmacy",   // pharmacy | delivery_agent | system | doctor
  targetId: ObjectId(), targetName: "Kenema Pharmacy #4",
  issue: "Wrong medication dispensed", details: "...",
  severity: "high",         // low | medium | high
  status: "open",           // open | resolved | dismissed
  resolvedById: null, resolvedAt: null, resolution: null,
  createdAt: ISODate(), updatedAt: ISODate()
}
```
```js
db.complaints.createIndex({ status: 1, severity: -1 })
db.complaints.createIndex({ createdAt: -1 })
```

---

### `health_alerts`
```js
{
  _id: ObjectId(), createdById: ObjectId(),
  type: "Disease Outbreak",
  // "Disease Outbreak" | "Medication Recall" | "Emergency Health Advisory"
  region: "All Regions (National)",
  // "All Regions (National)" | "Addis Ababa" | "Amhara Region" | "Oromia Region"
  message: "Cholera outbreak in Dire Dawa.",
  details: "...", youtubeLink: "https://youtube.com/...",
  isActive: true, createdAt: ISODate()
}
```
```js
db.health_alerts.createIndex({ isActive: 1, createdAt: -1 })
```

---

### `audit_logs`
```js
{
  _id: ObjectId(), actorId: ObjectId(), actorName: "Admin_Sarah",
  action: "Approved pharmacy Kenema Pharmacy #4",
  targetType: "pharmacy", targetId: ObjectId(),
  metadata: { previousStatus: "reviewing", newStatus: "approved" },
  createdAt: ISODate()
}
```
```js
db.audit_logs.createIndex({ createdAt: -1 })
db.audit_logs.createIndex({ actorId: 1, createdAt: -1 })
// Auto-delete after 2 years
db.audit_logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 63072000 })
```

---

### `platform_config`
```js
{ _id: "default_delivery_fee_etb",    value: "50.00" }
{ _id: "chapa_mode",                  value: "test"  }    // test | live
{ _id: "otp_expiry_minutes",          value: "10"    }
{ _id: "payment_retry_window_min",    value: "60"    }
{ _id: "low_stock_threshold_default", value: "10"    }
{ _id: "max_cart_items",              value: "20"    }
```

---

## Embed vs Reference Summary

| Data | Strategy | Reason |
|---|---|---|
| User addresses | **Embed** in `users` | Bounded ≤10; always loaded with profile |
| User MFA | **Embed** in `users` | Tiny; always needed on login |
| Pharmacy license + docs | **Embed** in `pharmacies` | Always shown on profile |
| Order items | **Embed** in `orders` | Bounded ≤20; always fetched with order |
| Order status history | **Embed** in `orders` | Bounded ≤8 events; shown in tracking |
| Delivery snapshot | **Embed** in `delivery_assignments` | Agent needs all data instantly |
| Conversation last msg | **Embed** in `conversations` | Inbox preview without extra query |
| Messages | **Separate** `messages` | Unbounded; paginated |
| Reviews | **Separate** `reviews` | Aggregated for stats; paginated |
| Payments | **Separate** `payments` | Independent finance queries |
| Audit logs | **Separate** `audit_logs` | High volume; time-filtered queries |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | `{ identifier, password }` → `{ token, role, userId }` |
| POST | `/auth/mfa/verify` | `{ userId, code, type }` → `{ token }` |
| POST | `/auth/logout` | Invalidate token |
| POST | `/auth/register/patient` | Patient signup |
| POST | `/auth/register/pharmacy` | Pharmacy signup + doc upload |
| POST | `/auth/register/delivery` | Delivery agent signup |
| POST | `/auth/register/admin` | Admin signup (requires `authKey`) |
| POST | `/auth/password/reset-request` | Send OTP to phone |
| POST | `/auth/password/reset-verify-otp` | Verify OTP → `{ resetToken }` |
| POST | `/auth/password/reset` | `{ resetToken, newPassword }` |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/me` | Own profile |
| PUT | `/users/me` | Update profile |
| PUT | `/users/me/password` | Change password |
| GET | `/users/me/addresses` | List saved addresses |
| POST | `/users/me/addresses` | Add address |
| PUT | `/users/me/addresses/:id` | Update address |
| DELETE | `/users/me/addresses/:id` | Delete address |
| PATCH | `/users/me/addresses/:id/default` | Set default |

### Pharmacies
| Method | Endpoint | Description |
|---|---|---|
| GET | `/pharmacies` | `?lat=&lng=&search=` — nearby list |
| GET | `/pharmacies/:id` | Detail |
| GET | `/pharmacies/:id/inventory` | `?search=&category=&page=` |
| GET | `/pharmacies/:id/reviews` | `?page=` |
| POST | `/pharmacies/:id/reviews` | Submit review |
| GET | `/pharmacy/me` | Own profile (pharmacy auth) |
| PUT | `/pharmacy/me` | Update profile |
| GET | `/pharmacy/me/orders` | `?status=&date=&page=` |
| GET | `/pharmacy/me/inventory` | `?search=&category=&page=` |
| POST | `/pharmacy/me/inventory` | Add medication |
| PATCH | `/pharmacy/me/inventory/:id` | Update medication |
| DELETE | `/pharmacy/me/inventory/:id` | Remove |
| POST | `/pharmacy/me/inventory/bulk-upload` | CSV import |
| GET | `/pharmacy/me/inventory/alerts` | Low/out-of-stock items |
| GET | `/pharmacy/me/analytics` | `?period=7d\|30d\|90d` |
| GET | `/pharmacy/me/deliveries` | Delivery assignments |
| GET | `/pharmacy/me/reviews` | Own reviews |
| PATCH | `/prescriptions/:id/verify` | Pharmacy verifies prescription |

### Medications & Search
| Method | Endpoint | Description |
|---|---|---|
| GET | `/medications/:id` | Single medication |
| GET | `/search` | `?q=&type=medication\|pharmacy&category=&page=` |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Checkout — creates order + payment |
| GET | `/orders` | `?status=&page=` — own orders |
| GET | `/orders/:id` | Detail |
| PATCH | `/orders/:id/status` | Update status (pharmacy) |
| GET | `/orders/:id/tracking` | `{ status, statusHistory, agentLocation? }` |
| POST | `/orders/:id/assign-delivery` | Pharmacy assigns agent |
| DELETE | `/orders/:id` | Cancel (patient, only when pending) |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/payments/chapa/initiate` | `{ orderId }` → `{ checkoutUrl, txRef }` |
| POST | `/payments/chapa/webhook` | Chapa posts here — HMAC verified |
| GET | `/payments/:id` | Payment detail |
| GET | `/payments/:id/verify` | Manual re-verify via Chapa |

### Prescriptions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/prescriptions/upload` | `multipart/form-data` → `{ uploadId, fileUrl }` |
| GET | `/prescriptions/:id` | Detail |

### Deliveries
| Method | Endpoint | Description |
|---|---|---|
| GET | `/delivery/me/assignment` | Active assignment for agent |
| PATCH | `/deliveries/:id/accept` | Accept |
| PATCH | `/deliveries/:id/decline` | `{ reason }` |
| PATCH | `/deliveries/:id/step` | `{ step: 1\|2\|3\|4 }` |
| PATCH | `/deliveries/:id/complete` | `{ photoProofUrl?, cashCollected }` |
| GET | `/delivery/me/earnings` | `?period=today\|week\|month` |
| GET | `/delivery/me/history` | `?page=` |

### Conversations & Messages
| Method | Endpoint | Description |
|---|---|---|
| GET | `/conversations` | Inbox |
| POST | `/conversations` | `{ participantId, orderId? }` |
| GET | `/conversations/:id/messages` | `?page=` |
| POST | `/conversations/:id/messages` | `{ content }` |
| PATCH | `/conversations/:id/read` | Mark read |

### Hospitals · Alerts · Complaints · AI
| Method | Endpoint | Description |
|---|---|---|
| GET | `/hospitals` | `?lat=&lng=&page=` |
| GET | `/hospitals/:id` | Detail |
| GET | `/alerts/active` | Current broadcast alert |
| POST | `/alerts` | Admin: create alert |
| PATCH | `/alerts/:id` | Admin: deactivate |
| POST | `/complaints` | Submit |
| GET | `/complaints/:id` | View |
| POST | `/ai/chat` | `{ messages }` → Gemini streaming |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/stats` | Platform KPIs |
| GET | `/admin/system-health` | API/DB/CDN metrics |
| GET | `/admin/users` | `?role=&search=&page=` |
| PATCH | `/admin/users/:id` | Suspend/activate |
| DELETE | `/admin/users/:id` | Delete user |
| GET | `/admin/verifications` | `?status=pending&page=` |
| PATCH | `/admin/verifications/:id` | `{ action: approved\|rejected\|needs_docs }` |
| GET | `/admin/orders` | `?status=&pharmacyId=&page=` |
| GET | `/admin/deliveries` | `?status=&page=` |
| GET | `/admin/complaints` | `?severity=&status=&page=` |
| PATCH | `/admin/complaints/:id` | `{ status, resolution }` |
| GET | `/admin/analytics` | `?period=` |
| GET | `/admin/alerts` | All alerts |
| GET | `/admin/audit-logs` | `?actorId=&dateRange=&page=` |
| GET | `/admin/payments` | Platform-wide payments |

---

## Order Status Machine

```
pending → confirmed → preparing → ready → dispatched → delivered
pending → rejected   (pharmacy)
pending → cancelled  (patient)
confirmed → cancelled (patient / pharmacy)
```

## Payment Status Machine

```
Chapa:  initiated → pending → success
                           → failed (allow retry)
                           → refunded
                           → reversed
COD:    cod_pending → cod_collected
```

## Chapa tx_ref Format

```
medcare-{orderId}-{unixTimestamp}
Example: medcare-ORD-48821-1746203460
```

Webhook verification: `x-chapa-signature` = HMAC-SHA256 of payload body using `CHAPA_WEBHOOK_SECRET`.
After webhook: always call `GET https://api.chapa.co/v1/transaction/verify/{tx_ref}` and assert `status=success`, `amount` matches, `currency=ETB`, `mode=live`.

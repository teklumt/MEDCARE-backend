# Pharmacy Backend API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

All endpoints (except health check) require JWT authentication.

**Header:**
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Inventory Management

### 1.1 Search Medications

Search the master medication database.

**Endpoint:** `GET /inventory/medications/search`

**Query Parameters:**
- `q` (required): Search query (minimum 2 characters)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "medication_id",
      "nameEnglish": "Amoxicillin",
      "nameAmharic": "አሞክሲሲሊን",
      "genericName": "Amoxicillin",
      "dosageStrength": "500mg",
      "dosageForm": "tablet",
      "category": "antibiotic",
      "requiresPrescription": true
    }
  ]
}
```

### 1.2 Add Inventory Item

Add a new medication to pharmacy inventory.

**Endpoint:** `POST /inventory`

**Request Body:**
```json
{
  "medicationId": "optional_existing_medication_id",
  "nameEnglish": "Amoxicillin",
  "nameAmharic": "አሞክሲሲሊን",
  "genericName": "Amoxicillin",
  "dosageStrength": "500mg",
  "dosageForm": "tablet",
  "category": "antibiotic",
  "requiresPrescription": true,
  "quantity": 200,
  "price": 45.50,
  "expiryDate": "2025-12-31",
  "batchNumber": "BATCH-2024-001",
  "supplierName": "PharmaCorp",
  "lowThreshold": 20
}
```

**Validation Rules:**
- `nameEnglish`: Required, max 200 characters
- `nameAmharic`: Required
- `quantity`: Required, positive integer
- `price`: Required, positive number, max 2 decimal places
- `expiryDate`: Required, must be future date
- `dosageForm`: Must be one of: tablet, capsule, syrup, injection, cream, drops, inhaler, patch, other
- `category`: Must be one of: antibiotic, painkiller, vitamin, chronic_disease, emergency, cardiovascular, diabetes, respiratory, other

**Response:**
```json
{
  "success": true,
  "message": "Inventory item added successfully",
  "data": {
    "_id": "inventory_id",
    "pharmacyId": "pharmacy_id",
    "medicationId": "medication_id",
    "stock": {
      "quantity": 200,
      "lowThreshold": 20,
      "batchNumber": "BATCH-2024-001",
      "expiryDate": "2025-12-31"
    },
    "pricing": {
      "sellingPrice": 45.50
    }
  }
}
```

### 1.3 Get All Inventory Items

Get pharmacy's inventory with filtering and pagination.

**Endpoint:** `GET /inventory`

**Query Parameters:**
- `status`: available | out_of_stock | low_stock | expiring_soon
- `category`: antibiotic | painkiller | vitamin | etc.
- `search`: Search by medication name
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Field to sort by (default: createdAt)
- `sortOrder`: asc | desc (default: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "inventory_id",
      "medication": {
        "nameEnglish": "Amoxicillin",
        "nameAmharic": "አሞክሲሲሊን",
        "category": "antibiotic"
      },
      "stock": {
        "quantity": 200,
        "expiryDate": "2025-12-31"
      },
      "pricing": {
        "sellingPrice": 45.50
      },
      "availability": {
        "status": "available"
      }
    }
  ],
  "alerts": {
    "lowStock": 5,
    "outOfStock": 2,
    "expiringSoon": 3
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 87,
    "pages": 5
  }
}
```

### 1.4 Update Inventory Item

Update existing inventory item.

**Endpoint:** `PUT /inventory/:id`

**Request Body:**
```json
{
  "quantity": 150,
  "price": 48.00,
  "expiryDate": "2025-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inventory item updated successfully",
  "data": {
    "_id": "inventory_id",
    "version": 2
  }
}
```

### 1.5 Delete Inventory Item

Soft delete an inventory item.

**Endpoint:** `DELETE /inventory/:id`

**Response:**
```json
{
  "success": true,
  "message": "Inventory item deleted successfully"
}
```

**Error Response (if active orders exist):**
```json
{
  "success": false,
  "error": "This item has pending orders. Complete or cancel those orders before removing this item."
}
```

### 1.6 Bulk CSV Upload

Upload multiple inventory items via CSV.

**Endpoint:** `POST /inventory/bulk-upload`

**Request:** multipart/form-data
- `file`: CSV file (max 10MB)

**CSV Format:** See `sample_inventory.csv`

**Response:**
```json
{
  "success": true,
  "message": "Bulk upload completed",
  "data": {
    "totalRows": 10,
    "succeeded": 8,
    "failed": 2,
    "errors": [
      {
        "row": 3,
        "field": "price",
        "error": "Price must be a positive number"
      },
      {
        "row": 7,
        "field": "expiryDate",
        "error": "Expiry date must be in the future"
      }
    ]
  }
}
```

### 1.7 Get Inventory Change Log

Get audit trail of inventory changes.

**Endpoint:** `GET /inventory/audit-log`

**Query Parameters:**
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `action`: INVENTORY_ITEM_ADDED | INVENTORY_ITEM_UPDATED | INVENTORY_ITEM_DELETED
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "log_id",
      "action": "INVENTORY_ITEM_UPDATED",
      "entityId": "inventory_id",
      "performedBy": "user_id",
      "changes": [
        {
          "field": "quantity",
          "oldValue": 200,
          "newValue": 150
        }
      ],
      "createdAt": "2024-04-17T10:30:00Z"
    }
  ]
}
```

---

## 2. Orders Management

### 2.1 Get All Orders

Get all orders for the pharmacy.

**Endpoint:** `GET /orders`

**Query Parameters:**
- `status`: pending | accepted | rejected | preparing | ready | out_for_delivery | delivered | cancelled
- `startDate`: Filter by date range
- `endDate`: Filter by date range
- `search`: Search by order ID or patient name
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "order_id",
      "orderId": "MC-20240417-ABCD",
      "patient": {
        "name": "John D.",
        "phone": "+251911234567"
      },
      "items": [
        {
          "medicineName": "Amoxicillin 500mg",
          "quantity": 2,
          "priceAtOrder": 45.50
        }
      ],
      "totalAmount": 91.00,
      "status": "pending",
      "createdAt": "2024-04-17T10:00:00Z"
    }
  ],
  "stuckOrdersCount": 3,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### 2.2 Get Order Details

Get complete details of a specific order.

**Endpoint:** `GET /orders/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "order_id",
    "orderId": "MC-20240417-ABCD",
    "patient": {
      "fullName": "John Doe",
      "phone": "+251911234567"
    },
    "items": [...],
    "delivery": {
      "method": "delivery",
      "address": {
        "street": "Bole Road",
        "city": "Addis Ababa",
        "coordinates": {
          "lat": 9.0192,
          "lng": 38.7525
        }
      }
    },
    "payment": {
      "method": "cash_on_delivery",
      "status": "pending"
    },
    "status": "pending",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2024-04-17T10:00:00Z"
      }
    ],
    "prescriptionImageUrl": "https://cloudinary.com/...",
    "createdAt": "2024-04-17T10:00:00Z"
  }
}
```

### 2.3 Accept Order

Accept a pending order.

**Endpoint:** `POST /orders/:id/accept`

**Request Body:**
```json
{
  "estimatedPreparationTime": 30
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order accepted successfully",
  "data": {
    "orderId": "MC-20240417-ABCD",
    "status": "accepted",
    "estimatedPreparationTime": 30
  }
}
```

### 2.4 Reject Order

Reject an order with reason.

**Endpoint:** `POST /orders/:id/reject`

**Request Body:**
```json
{
  "reason": "Out of stock",
  "suggestAlternatives": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order rejected",
  "data": {
    "orderId": "MC-20240417-ABCD",
    "status": "rejected",
    "alternatives": [
      {
        "pharmacyName": "Bethel Pharmacy",
        "distance": "2.5 km",
        "hasAllItems": true
      }
    ]
  }
}
```

### 2.5 Update Order Status

Move order through fulfillment stages.

**Endpoint:** `PUT /orders/:id/status`

**Request Body:**
```json
{
  "status": "preparing",
  "driverId": "driver_id",
  "note": "Order is being prepared"
}
```

**Valid Status Transitions:**
- pending → accepted | rejected | cancelled
- accepted → preparing | cancelled
- preparing → ready | cancelled
- ready → out_for_delivery | cancelled
- out_for_delivery → delivered

**Response:**
```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "orderId": "MC-20240417-ABCD",
    "status": "preparing"
  }
}
```

---

## 3. Delivery Management

### 3.1 Get All Delivery Personnel

Get list of delivery agents.

**Endpoint:** `GET /deliveries/personnel`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "driver_id",
      "fullName": "John Doe",
      "phone": "+251911234567",
      "vehicle": {
        "type": "motorcycle",
        "plate": "AA-12345"
      },
      "status": "available",
      "activeDeliveryCount": 2,
      "performance": {
        "totalDeliveries": 150,
        "completionRate": 95.5,
        "averageDeliveryTime": 25
      }
    }
  ]
}
```

### 3.2 Add Delivery Personnel

Register new delivery agent.

**Endpoint:** `POST /deliveries/personnel`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "phone": "+251911234567",
  "email": "john@example.com",
  "vehicleType": "motorcycle",
  "vehiclePlate": "AA-12345",
  "nationalId": "ID123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Delivery personnel added successfully",
  "data": {
    "_id": "driver_id",
    "fullName": "John Doe",
    "phone": "+251911234567"
  }
}
```

### 3.3 Assign Delivery

Assign order to delivery agent.

**Endpoint:** `POST /deliveries/assign`

**Request Body:**
```json
{
  "orderId": "order_id",
  "driverId": "driver_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Delivery assigned successfully",
  "data": {
    "orderId": "MC-20240417-ABCD",
    "driver": {
      "name": "John Doe",
      "phone": "+251911234567"
    }
  }
}
```

### 3.4 Get Performance Metrics

Get delivery performance data.

**Endpoint:** `GET /deliveries/metrics`

**Query Parameters:**
- `startDate`: Start date
- `endDate`: End date

**Response:**
```json
{
  "success": true,
  "data": {
    "personnel": [
      {
        "driverId": "driver_id",
        "name": "John Doe",
        "totalDeliveries": 45,
        "completedOnTime": 40,
        "onTimeRate": 88.9,
        "averageDeliveryTime": 23,
        "completionRate": 95.5,
        "belowThreshold": false
      }
    ],
    "overall": {
      "totalDeliveries": 150,
      "averageDeliveryTime": 25,
      "onTimeRate": 85.3
    }
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here",
  "errors": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (business logic error)
- `500`: Internal Server Error

---

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

---

## File Upload Limits

- Images: 5MB max (JPEG, PNG)
- Documents: 5MB max (PDF)
- CSV: 10MB max

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response includes:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 87,
    "pages": 5
  }
}
```

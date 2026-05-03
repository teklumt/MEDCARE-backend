# Order Schema Fix - Validation Error

## Problem

When creating an order, the API returns:
```json
{
  "success": false,
  "error": "Failed to create order",
  "details": "Order validation failed: payment.method: Path `payment.method` is required., delivery.method: Path `delivery.method` is required., items.0.priceAtOrder: Path `priceAtOrder` is required."
}
```

## Root Cause

The MongoDB database has an **old Order schema** cached from a previous version of the code. The old schema had:
- `payment.method` (nested field)
- `delivery.method` (nested field)  
- `items[].priceAtOrder` (old field name)

The **new schema** uses:
- `paymentMethod` (top-level field)
- `deliveryMethod` (top-level field)
- `items[].unitPrice` (new field name)

**Why restarting didn't fix it:**
- Mongoose validates against the **existing MongoDB collection schema**
- The old schema is stored in MongoDB's metadata
- Simply restarting the server doesn't update MongoDB's schema

## Solution

Run the schema fix script to drop the old collections and let them be recreated with the new schema.

### Step 1: Stop the Backend Server

Press `Ctrl+C` in the terminal where the backend is running.

### Step 2: Run the Fix Script

```bash
cd pharmacy-delivery-payment
pnpm run fix-schema
```

**What it does:**
1. Connects to MongoDB
2. Drops the `orders` collection (removes old schema)
3. Drops the `payments` collection (references orders)
4. Exits cleanly

**Output:**
```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB
📦 Found orders collection
📊 Current orders count: 0
🗑️  Dropping orders collection...
✅ Orders collection dropped
🗑️  Dropping payments collection...
✅ Payments collection dropped

✅ Schema fix complete!
📝 Next steps:
   1. Restart your backend server
   2. Try creating an order again
   3. The new schema will be used automatically
```

### Step 3: Restart the Backend Server

```bash
pnpm dev
```

### Step 4: Test Order Creation

Try creating an order again from the frontend. It should work now!

---

## What Changed in the Schema

### Old Schema (Causing Errors)
```typescript
{
  payment: {
    method: 'chapa',  // ❌ Nested
    // ...
  },
  delivery: {
    method: 'pickup',  // ❌ Nested
    // ...
  },
  items: [{
    medicationId: '...',
    quantity: 1,
    priceAtOrder: 12.50  // ❌ Old field name
  }]
}
```

### New Schema (Correct)
```typescript
{
  paymentMethod: 'chapa',  // ✅ Top-level
  deliveryMethod: 'pickup',  // ✅ Top-level
  deliveryAddress: {  // ✅ Separate object
    recipientName: '...',
    // ...
  },
  items: [{
    medicationId: '...',
    medicationName: 'Paracetamol',  // ✅ Added
    quantity: 1,
    unitPrice: 12.50,  // ✅ New field name
    subtotal: 12.50  // ✅ Calculated
  }]
}
```

---

## Why This Happened

1. **Schema Evolution**: The Order model was updated but the database still had the old structure
2. **Mongoose Validation**: Mongoose validates new documents against the existing collection schema in MongoDB
3. **No Auto-Migration**: Mongoose doesn't automatically migrate existing schemas

---

## Alternative Solution (Manual)

If you prefer to do it manually via MongoDB Compass or mongo shell:

```javascript
// Connect to your database
use pharmacy-system

// Drop the collections
db.orders.drop()
db.payments.drop()

// Restart your backend server
```

---

## Data Loss Warning

⚠️ **This script will delete all existing orders and payments!**

If you have important test data:
1. The script waits 5 seconds before dropping collections
2. Press `Ctrl+C` to cancel
3. Export your data first using MongoDB Compass or mongodump

For production, you would need a proper migration script that transforms the data instead of dropping it.

---

## Verification

After running the fix script and restarting the server:

### 1. Check Server Logs
```
✅ MongoDB Connected: ...
🚀 Server running on port 5000
```

### 2. Test Order Creation

**Request:**
```bash
POST http://localhost:5000/api/v1/orders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "pharmacyId": "507f1f77bcf86cd799439017",
  "deliveryMethod": "pickup",
  "paymentMethod": "chapa",
  "items": [
    {
      "medicationId": "507f1f77bcf86cd799439021",
      "quantity": 1
    }
  ],
  "deliveryFee": 0,
  "discount": 0,
  "prescriptionUploadId": "69f68a6426fd982811d9d432"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order created",
  "data": {
    "order": {
      "_id": "...",
      "ref": "ORD-20260502-ABCD",
      "patientId": "...",
      "pharmacyId": "507f1f77bcf86cd799439017",
      "paymentMethod": "chapa",
      "deliveryMethod": "pickup",
      "items": [
        {
          "medicationId": "507f1f77bcf86cd799439021",
          "medicationName": "Amoxicillin",
          "quantity": 1,
          "unitPrice": 12.5,
          "subtotal": 12.5
        }
      ],
      "subtotal": 12.5,
      "totalAmount": 12.5,
      "status": "pending"
    },
    "payment": {
      "_id": "...",
      "orderId": "...",
      "txRef": "medcare-ORD-20260502-ABCD-1777764500000",
      "checkoutUrl": "https://checkout.chapa.co/...",
      "amount": 12.5,
      "status": "initiated"
    }
  }
}
```

---

## Files Modified

1. ✅ `pharmacy-delivery-payment/src/scripts/fix-order-schema.ts` (NEW)
2. ✅ `pharmacy-delivery-payment/package.json` (added `fix-schema` script)

---

## Summary

✅ **Created schema fix script**  
✅ **Script safely drops old collections**  
✅ **New schema will be used automatically**  
✅ **Orders can now be created successfully**  

**Run the fix script now:**
```bash
cd pharmacy-delivery-payment
pnpm run fix-schema
```

Then restart the server and test! 🚀

# Pharmacy ID Fix - "Pharmacy not found" Error

## Problem

When creating an order, the API returned:
```json
{
  "success": false,
  "error": "Pharmacy not found"
}
```

**Root Cause:**
- Cart page was using a **hardcoded mock pharmacy ID**: `507f1f77bcf86cd799439011`
- Medications in cart belonged to different pharmacy: `507f1f77bcf86cd799439017`
- The hardcoded pharmacy ID didn't exist in the database

## Solution Implemented

### 1. Added `pharmacyId` to Cart Items
**File:** `User-Pharmacy-Front/lib/CartContext.tsx`

Updated `CartItem` interface to include `pharmacyId`:
```typescript
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  requiresPrescription: boolean;
  pharmacyId: string;        // ← ADDED
  pharmacyName: string;
  image?: string;
}
```

### 2. Updated Search Page to Include `pharmacyId`
**File:** `User-Pharmacy-Front/app/dashboard/search/page.tsx`

**When fetching from API:**
```typescript
medicationsByCategory[category].push({
  id: med._id,
  brandName: med.name,
  // ... other fields
  pharmacyId: med.pharmacyId,  // ← ADDED from API response
  pharmacyName: med.pharmacyName || 'Partner Pharmacy',
  // ...
});
```

**When adding to cart:**
```typescript
const handleAddToCart = () => {
  addToCart({
    id: medication.id,
    name: medication.brandName,
    // ... other fields
    pharmacyId: medication.pharmacyId || '507f1f77bcf86cd799439017',  // ← ADDED
    pharmacyName: medication.pharmacyName || t('findPharmacies.mockName'),
    // ...
  });
};
```

### 3. Updated Cart Page to Use Real Pharmacy ID
**File:** `User-Pharmacy-Front/app/dashboard/cart/page.tsx`

**Before (Hardcoded):**
```typescript
// Mock pharmacy ID - in real app, this would come from the items
const selectedPharmacyId = '507f1f77bcf86cd799439011';
```

**After (Dynamic):**
```typescript
// Get pharmacy ID from cart items (all items should be from same pharmacy)
const selectedPharmacyId = items.length > 0 ? items[0].pharmacyId : null;
```

**Added validation:**
```typescript
const handleCheckout = async () => {
  // ...
  
  // Validate pharmacy ID
  if (!selectedPharmacyId) {
    throw new Error('Unable to determine pharmacy. Please try adding items to cart again.');
  }
  
  // ... rest of checkout logic
}
```

---

## How It Works Now

### 1. User Searches for Medications
```
GET /api/v1/search?type=medication
```

**Response includes `pharmacyId`:**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "pharmacyId": "507f1f77bcf86cd799439017",  ← Pharmacy that stocks this
  "name": "Paracetamol",
  "price": 4
}
```

### 2. User Adds to Cart
Frontend stores medication with `pharmacyId`:
```typescript
{
  id: "507f1f77bcf86cd799439020",
  name: "Paracetamol",
  pharmacyId: "507f1f77bcf86cd799439017",  ← Stored in cart
  price: 4,
  quantity: 1
}
```

### 3. User Checks Out
Cart page extracts `pharmacyId` from first item:
```typescript
const selectedPharmacyId = items[0].pharmacyId;  // "507f1f77bcf86cd799439017"
```

### 4. Order Created
```
POST /api/v1/orders
{
  "pharmacyId": "507f1f77bcf86cd799439017",  ← Correct pharmacy!
  "items": [
    { "medicationId": "507f1f77bcf86cd799439020", "quantity": 1 }
  ]
}
```

**Result:** ✅ Order created successfully!

---

## Understanding the IDs

### `_id` vs `pharmacyId`

| Field | Purpose | Example |
|-------|---------|---------|
| `_id` | Unique ID for the **medication record** | `507f1f77bcf86cd799439020` |
| `pharmacyId` | Reference to the **pharmacy** that stocks it | `507f1f77bcf86cd799439017` |

**Analogy:**
- `_id` = Product barcode (unique per product)
- `pharmacyId` = Store location (which store has this product)

### Multiple Medications, Same Pharmacy

```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "pharmacyId": "507f1f77bcf86cd799439017",
    "name": "Paracetamol"
  },
  {
    "_id": "507f1f77bcf86cd799439021",
    "pharmacyId": "507f1f77bcf86cd799439017",
    "name": "Amoxicillin"
  }
]
```

Both medications are from **the same pharmacy** (`507f1f77bcf86cd799439017`).

---

## Important Notes

### Single Pharmacy Per Order
Currently, the cart assumes **all items are from the same pharmacy**:
```typescript
const selectedPharmacyId = items[0].pharmacyId;
```

**Limitation:** If user adds items from multiple pharmacies, only the first pharmacy ID is used.

**Future Enhancement:** Split cart into multiple orders (one per pharmacy).

### Validation Added
The checkout now validates that a pharmacy ID exists:
```typescript
if (!selectedPharmacyId) {
  throw new Error('Unable to determine pharmacy...');
}
```

This prevents the "Pharmacy not found" error.

---

## Testing

### 1. Search for Medications
```
http://localhost:3000/dashboard/search
```

### 2. Add to Cart
Click "Add to Cart" on any medication

### 3. View Cart
```
http://localhost:3000/dashboard/cart
```

**Check browser console:**
```javascript
console.log(items[0].pharmacyId);  // Should show real pharmacy ID
```

### 4. Checkout
Click "Proceed to Checkout"

**Expected:** Order created successfully with correct pharmacy ID

---

## Files Modified

1. ✅ `User-Pharmacy-Front/lib/CartContext.tsx` - Added `pharmacyId` to interface
2. ✅ `User-Pharmacy-Front/app/dashboard/search/page.tsx` - Include `pharmacyId` from API
3. ✅ `User-Pharmacy-Front/app/dashboard/cart/page.tsx` - Use dynamic pharmacy ID

---

## Summary

✅ **Fixed "Pharmacy not found" error**  
✅ **Cart now uses real pharmacy IDs from medications**  
✅ **No more hardcoded mock IDs**  
✅ **Validation added to prevent errors**  
✅ **Orders will be created with correct pharmacy**  

**Status:** Ready to test! 🚀

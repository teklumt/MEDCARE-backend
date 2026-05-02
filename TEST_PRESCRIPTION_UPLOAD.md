# Test Prescription Upload - Quick Guide

## Prerequisites
1. Backend server running on `http://localhost:5000`
2. Valid authentication token (login first)
3. Test image file (JPEG, PNG, or PDF)

---

## Step 1: Login to Get Token

**Request:**
```bash
POST http://localhost:5002/api/admin/auth/login
Content-Type: application/json

{
  "email": "abel.user@medcare-et.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "..."
    }
  }
}
```

**Save the `accessToken` for next step!**

---

## Step 2: Upload Prescription

### Using cURL:
```bash
curl -X POST http://localhost:5000/api/v1/prescriptions/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/prescription.jpg" \
  -F "orderId=optional_order_id"
```

### Using Postman/Thunder Client:
1. **Method:** POST
2. **URL:** `http://localhost:5000/api/v1/prescriptions/upload`
3. **Headers:**
   - `Authorization: Bearer YOUR_ACCESS_TOKEN`
4. **Body:** form-data
   - Key: `file` | Type: File | Value: Select your image/PDF
   - Key: `orderId` | Type: Text | Value: (optional)

### Using JavaScript (Frontend):
```javascript
const token = localStorage.getItem('admin_access_token');
const formData = new FormData();
formData.append('file', prescriptionFile); // File object from input
formData.append('orderId', 'optional_order_id');

const response = await fetch('http://localhost:5000/api/v1/prescriptions/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

---

## Expected Response

### Success (201 Created):
```json
{
  "success": true,
  "message": "Prescription uploaded successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "patientId": "507f1f77bcf86cd799439014",
    "orderId": null,
    "fileUrl": "http://localhost:5000/uploads/prescriptions/prescription-1777762500-123456789.jpg",
    "fileType": "image",
    "uploadedAt": "2026-05-03T10:30:00.000Z",
    "verificationStatus": "pending",
    "__v": 0
  }
}
```

### Error - No File:
```json
{
  "success": false,
  "error": "Please upload a file or provide fileUrl and fileType"
}
```

### Error - Invalid File Type:
```json
{
  "success": false,
  "error": "Invalid file type. Only JPEG, PNG, and PDF files are allowed."
}
```

### Error - File Too Large:
```json
{
  "success": false,
  "error": "File too large"
}
```

### Error - Unauthorized:
```json
{
  "success": false,
  "error": "Authentication required"
}
```

---

## Step 3: Verify File Access

Copy the `fileUrl` from the response and open it in your browser:

```
http://localhost:5000/uploads/prescriptions/prescription-1777762500-123456789.jpg
```

**Expected:** The uploaded image/PDF should display or download.

---

## Step 4: Check File on Disk

Navigate to the backend directory and check:

```bash
cd pharmacy-delivery-payment
ls -la uploads/prescriptions/
```

**Expected:** You should see the uploaded file:
```
prescription-1777762500-123456789.jpg
```

---

## Troubleshooting

### Issue: 401 Unauthorized
**Solution:** 
- Make sure you're logged in
- Check that token is valid and not expired
- Verify Authorization header format: `Bearer {token}`

### Issue: 400 Bad Request - "Please upload a file..."
**Solution:**
- Check that form field name is `file` (not `prescription` or other)
- Verify Content-Type is `multipart/form-data`
- Make sure file is actually selected

### Issue: 404 Not Found
**Solution:**
- Verify backend is running on port 5000
- Check URL: `http://localhost:5000/api/v1/prescriptions/upload`
- Ensure prescriptions routes are registered in server.ts

### Issue: 500 Internal Server Error
**Solution:**
- Check backend console for error details
- Verify MongoDB connection is working
- Check that uploads directory has write permissions

### Issue: File URL returns 404
**Solution:**
- Verify static file serving is configured in server.ts
- Check that file exists in `uploads/prescriptions/` directory
- Restart backend server

---

## Testing from Frontend (Cart Page)

The cart page already has prescription upload integrated:

1. **Navigate to:** `http://localhost:3000/dashboard/cart`
2. **Add items to cart**
3. **Click "Upload Prescription"**
4. **Select a file** (JPEG, PNG, or PDF)
5. **Click "Proceed to Checkout"**

The file will be uploaded automatically when you proceed to checkout.

---

## File Validation Rules

| Rule | Value |
|------|-------|
| **Allowed Types** | JPEG, PNG, PDF |
| **Max File Size** | 5 MB |
| **Required Auth** | Yes (Bearer token) |
| **Required Role** | Patient |
| **Storage** | Local (uploads/prescriptions/) |

---

## API Endpoint Summary

```
POST /api/v1/prescriptions/upload
```

**Authentication:** Required  
**Authorization:** Patient role  
**Content-Type:** multipart/form-data  

**Form Fields:**
- `file` (required): Image or PDF file
- `orderId` (optional): Associated order ID

**Response:** Prescription object with `fileUrl`

---

## Next Steps After Upload

1. **Retrieve Prescription:**
   ```
   GET /api/v1/prescriptions/{id}
   ```

2. **Verify Prescription (Pharmacy):**
   ```
   PATCH /api/v1/prescriptions/{id}/verify
   ```

3. **Link to Order:**
   - Include prescription ID when creating order
   - Order will reference the prescription

---

## Quick Test Checklist

- [ ] Backend running on port 5000
- [ ] Logged in and have access token
- [ ] Test file ready (JPEG/PNG/PDF, < 5MB)
- [ ] Upload via Postman/cURL successful
- [ ] Response contains valid `fileUrl`
- [ ] File accessible via browser
- [ ] File exists in `uploads/prescriptions/` directory
- [ ] Frontend cart page upload working

---

**Status:** Ready to test! 🚀

**See also:** `PRESCRIPTION_UPLOAD_FIX.md` for detailed implementation docs

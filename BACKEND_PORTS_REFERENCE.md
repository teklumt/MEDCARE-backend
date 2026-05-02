# 🔌 Backend Ports Reference

## Port Configuration

Your project has **TWO separate backends** running on different ports:

### 1. Main Backend (pharmacy-delivery-payment)
**Port:** `5000`  
**Base URL:** `http://localhost:5000`  
**API Base:** `http://localhost:5000/api/v1`

**Endpoints:**
- Auth: `http://localhost:5000/api/v1/auth/*`
- Users: `http://localhost:5000/api/v1/users/*`
- Pharmacies: `http://localhost:5000/api/v1/pharmacies/*`
- Orders: `http://localhost:5000/api/v1/orders/*`
- Payments: `http://localhost:5000/api/v1/payments/*`
- And more...

**Used By:** User-facing frontend (patients, pharmacies, delivery agents)

---

### 2. Admin Backend (Admin-Backend)
**Port:** `5002`  
**Base URL:** `http://localhost:5002`  
**API Base:** `http://localhost:5002/api/admin`

**Endpoints:**
- Auth: `http://localhost:5002/api/admin/auth/*`
- Admins: `http://localhost:5002/api/admin/admins/*`
- Users: `http://localhost:5002/api/admin/users/*`
- Pharmacies: `http://localhost:5002/api/admin/pharmacies/*`
- Licenses: `http://localhost:5002/api/admin/licenses/*`
- Analytics: `http://localhost:5002/api/admin/analytics/*`
- And more...

**Used By:** Admin dashboard/panel

---

## 🔧 How to Run Both Backends

### Terminal 1 - Main Backend (Port 5000):
```bash
cd pharmacy-delivery-payment
pnpm dev
```
**Expected Output:**
```
🚀 Server running on port 5000
✅ MongoDB connected successfully
```

### Terminal 2 - Admin Backend (Port 5002):
```bash
cd Admin-Backend
pnpm dev
```
**Expected Output:**
```
Server started on port 5002
```

---

## 🧪 Testing Admin Backend

### 1. Health Check
```bash
curl http://localhost:5002/health
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

### 2. Admin Login
```bash
curl -X POST http://localhost:5002/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@medcare-et.com",
    "password": "SuperAdmin@2024"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "superadmin@medcare-et.com",
      "role": "admin"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "..."
    }
  }
}
```

---

## 🎯 Your Issue

### ❌ Wrong URL (404 Error):
```
http://localhost:5000/api/admin/auth/login
```
This tries to access the **Main Backend** (port 5000) which doesn't have `/api/admin` routes.

### ✅ Correct URL:
```
http://localhost:5002/api/admin/auth/login
```
This accesses the **Admin Backend** (port 5002) which has the admin routes.

---

## 📊 Port Summary

| Backend | Port | API Base | Purpose |
|---------|------|----------|---------|
| **Main Backend** | 5000 | `/api/v1` | User-facing features |
| **Admin Backend** | 5002 | `/api/admin` | Admin management |
| **Frontend** | 3000 | N/A | User interface |

---

## 🔐 Default Admin Credentials

**Email:** `superadmin@medcare-et.com`  
**Password:** `SuperAdmin@2024`

These are configured in `Admin-Backend/.env`:
```env
SUPER_ADMIN_EMAIL=superadmin@medcare-et.com
SUPER_ADMIN_PASSWORD=SuperAdmin@2024
```

---

## 🛠️ Configuration Files

### Main Backend Port:
**File:** `pharmacy-delivery-payment/.env`
```env
PORT=5000
```

### Admin Backend Port:
**File:** `Admin-Backend/.env`
```env
PORT=5002
```

---

## 🚨 Common Issues

### Issue 1: "Cannot connect to backend"
**Cause:** Backend not running  
**Solution:** Start the backend with `pnpm dev`

### Issue 2: "404 Not Found on /api/admin"
**Cause:** Using wrong port (5000 instead of 5002)  
**Solution:** Use port 5002 for admin endpoints

### Issue 3: "Port already in use"
**Cause:** Another process using the port  
**Solution:** 
- Kill the process: `npx kill-port 5000` or `npx kill-port 5002`
- Or change the port in `.env` file

### Issue 4: "CORS error"
**Cause:** Frontend URL not in CORS whitelist  
**Solution:** Add your frontend URL to CORS_ORIGIN in `.env`

---

## 📝 Quick Reference

### Main Backend Endpoints:
```
POST   /api/v1/auth/login
POST   /api/v1/auth/register/patient
GET    /api/v1/users/me
GET    /api/v1/pharmacies
POST   /api/v1/orders
POST   /api/v1/payments/chapa/initiate
```

### Admin Backend Endpoints:
```
POST   /api/admin/auth/login
GET    /api/admin/admins
GET    /api/admin/users
GET    /api/admin/pharmacies
GET    /api/admin/analytics
GET    /api/admin/audit-logs
```

---

## 🎉 Solution for Your Issue

Change your request URL from:
```
❌ http://localhost:5000/api/admin/auth/login
```

To:
```
✅ http://localhost:5002/api/admin/auth/login
```

And make sure the Admin Backend is running on port 5002!

---

**Last Updated:** May 3, 2026  
**Reference:** Backend Ports Configuration


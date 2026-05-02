# 🧪 User Authentication Testing Guide

## ✅ What Was Fixed

### 1. Token Storage
**Problem:** Frontend was looking for `medcare_access_token` but login stored `admin_access_token`

**Solution:** Updated API client to check both locations:
```typescript
const getToken = () => {
  return localStorage.getItem('admin_access_token') || localStorage.getItem('medcare_access_token');
};
```

### 2. User Data Storage
**Problem:** Login response has different format than what frontend components expect

**Login Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439014",
    "email": "abel.user@medcare-et.com",
    "username": "abel_demo",
    "role": "patient"
  }
}
```

**Frontend Expects:**
- `medcare_user_name` - for display
- `medcare_first_name` - for navbar
- `medcare_username` - for profile
- `medcare_role` - for routing

**Solution:** Updated `storeAuthData()` to store data in all expected formats

---

## 🔄 Complete User Flow

### 1. Login Process

**Step 1: User visits login page**
```
http://localhost:3000/login
```

**Step 2: User enters credentials**
```
Email: abel.user@medcare-et.com
Password: [user's password]
```

**Step 3: Frontend calls Admin-Backend**
```javascript
POST http://localhost:5002/api/admin/auth/login
{
  "email": "abel.user@medcare-et.com",
  "password": "password123"
}
```

**Step 4: Admin-Backend returns tokens**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439014",
      "email": "abel.user@medcare-et.com",
      "username": "abel_demo",
      "role": "patient",
      "isActive": true,
      "permissions": ["order.create", "order.read", "pharmacy.read"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Step 5: Frontend stores data in localStorage**
```javascript
localStorage.setItem('admin_access_token', tokens.accessToken);
localStorage.setItem('admin_refresh_token', tokens.refreshToken);
localStorage.setItem('medcare_role', 'patient');
localStorage.setItem('medcare_username', 'abel_demo');
localStorage.setItem('medcare_user_name', 'abel_demo');
localStorage.setItem('medcare_first_name', 'Abel');
localStorage.setItem('medcare_last_name', 'Demo');
localStorage.setItem('medcare_user_email', 'abel.user@medcare-et.com');
localStorage.setItem('medcare_user_data', JSON.stringify(user));
```

**Step 6: User redirected to dashboard**
```
http://localhost:3000/dashboard
```

---

### 2. Making Authenticated Requests

**Example: Upload Prescription**

**Step 1: User uploads file**
```javascript
const formData = new FormData();
formData.append('file', prescriptionFile);
```

**Step 2: Frontend calls Main Backend**
```javascript
POST http://localhost:5000/api/v1/prescriptions/upload
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: multipart/form-data
Body:
  file: [prescription.jpg]
```

**Step 3: Main Backend validates token**
```javascript
// Auth middleware extracts token
const token = req.headers.authorization.substring(7);

// Verifies with JWT_SECRET
const decoded = jwt.verify(token, process.env.JWT_SECRET, {
  issuer: 'http://localhost:5000',
  audience: 'http://localhost:5000'
});

// Decoded payload:
{
  "sub": "507f1f77bcf86cd799439014",
  "role": "patient",
  "mfa": false,
  "permissions": ["order.create", "order.read", "pharmacy.read"],
  "iat": 1777762313,
  "exp": 1777763213,
  "aud": "http://localhost:5000",
  "iss": "http://localhost:5000"
}

// Converts to req.user format
req.user = {
  userId: "507f1f77bcf86cd799439014",
  role: "patient"
};
```

**Step 4: Request processed successfully**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "fileUrl": "https://cloudinary.com/...",
    "uploadedAt": "2026-05-03T..."
  }
}
```

---

## 🧪 Testing Checklist

### ✅ Login Flow
- [ ] Navigate to http://localhost:3000/login
- [ ] Enter valid credentials
- [ ] Click "Sign In"
- [ ] Should redirect to dashboard
- [ ] Navbar should show username (e.g., "Abel")
- [ ] Check localStorage has all required keys

### ✅ Dashboard Display
- [ ] Username displays correctly in navbar
- [ ] User initial shows in avatar (e.g., "A" for Abel)
- [ ] Role-based navigation works
- [ ] No "Guest User" showing

### ✅ Authenticated Requests
- [ ] Upload prescription - should work (no 401)
- [ ] Create order - should work
- [ ] View orders - should work
- [ ] Update profile - should work

### ✅ Token Validation
- [ ] Requests include Authorization header
- [ ] Token format is correct
- [ ] Backend validates token successfully
- [ ] User data attached to request

### ✅ Logout
- [ ] Click logout
- [ ] All localStorage keys cleared
- [ ] Redirected to login/home
- [ ] Cannot access protected routes

---

## 🔍 Debugging

### Check LocalStorage

Open browser console and run:
```javascript
// Check all auth keys
console.log('Access Token:', localStorage.getItem('admin_access_token'));
console.log('Refresh Token:', localStorage.getItem('admin_refresh_token'));
console.log('Role:', localStorage.getItem('medcare_role'));
console.log('Username:', localStorage.getItem('medcare_username'));
console.log('User Name:', localStorage.getItem('medcare_user_name'));
console.log('First Name:', localStorage.getItem('medcare_first_name'));
console.log('User Data:', localStorage.getItem('medcare_user_data'));
```

**Expected Output:**
```
Access Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Refresh Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Role: patient
Username: abel_demo
User Name: abel_demo
First Name: Abel
User Data: {"id":"507f1f77bcf86cd799439014","email":"abel.user@medcare-et.com",...}
```

### Decode JWT Token

Use https://jwt.io to decode the access token:

**Paste your token and verify:**
- `sub` = user ID
- `role` = patient/pharmacy/admin/delivery
- `iss` = http://localhost:5000
- `aud` = http://localhost:5000
- `exp` = expiration timestamp (15 minutes from `iat`)

### Check Network Requests

Open browser DevTools → Network tab:

**For authenticated requests, verify:**
1. Request has `Authorization: Bearer <token>` header
2. Response is 200 (not 401)
3. Response has expected data

**If 401 Unauthorized:**
- Check token is in localStorage
- Check token is being sent in header
- Check token is not expired
- Check JWT secrets match between backends

---

## 📊 User Data Mapping

### From Login Response → LocalStorage

| Login Response | LocalStorage Key | Used By |
|----------------|------------------|---------|
| `user.id` | `medcare_user_data.id` | API requests |
| `user.email` | `medcare_user_email` | Profile page |
| `user.username` | `medcare_username` | Profile page |
| `user.username` | `medcare_user_name` | Navbar display |
| `user.username` (split) | `medcare_first_name` | Navbar display |
| `user.username` (split) | `medcare_last_name` | Profile page |
| `user.role` | `medcare_role` | Routing, permissions |
| `tokens.accessToken` | `admin_access_token` | API authentication |
| `tokens.refreshToken` | `admin_refresh_token` | Token refresh |

### Username Parsing

**Example:** `abel_demo`
- First Name: `Abel` (capitalize first letter)
- Last Name: `Demo` (capitalize first letter)

**Example:** `john`
- First Name: `John`
- Last Name: (empty)

---

## 🎯 Expected Behavior

### After Successful Login:

1. **Navbar Shows:**
   - Avatar with first letter of name (e.g., "A")
   - Display name (e.g., "Abel")
   - Location: "Addis Ababa"

2. **LocalStorage Contains:**
   - 9 keys with user/auth data
   - Valid JWT tokens
   - User role and permissions

3. **API Requests:**
   - Include Authorization header
   - Return 200 status
   - No 401 errors

4. **Navigation:**
   - Can access all dashboard pages
   - Role-based routing works
   - No redirects to login

---

## 🚨 Common Issues

### Issue 1: "Guest User" Still Showing

**Cause:** User data not stored correctly

**Solution:**
1. Clear localStorage
2. Login again
3. Check `medcare_first_name` is set
4. Refresh page

### Issue 2: 401 on API Requests

**Cause:** Token not being sent or invalid

**Solution:**
1. Check `admin_access_token` exists in localStorage
2. Check API client is reading token correctly
3. Check token is not expired (15 min lifetime)
4. Check JWT secrets match between backends

### Issue 3: Wrong Dashboard After Login

**Cause:** Role-based routing not working

**Solution:**
1. Check `medcare_role` in localStorage
2. Verify login page routing logic
3. Check role value matches expected values

---

## 📝 Test Credentials

### Patient User:
```
Email: abel.user@medcare-et.com
Password: [ask admin for password]
Role: patient
Expected Dashboard: /dashboard
```

### Pharmacy User:
```
Email: pharmacy@medcare-et.com
Password: [ask admin for password]
Role: pharmacy
Expected Dashboard: /pharmacy
```

### Admin User:
```
Email: superadmin@medcare-et.com
Password: SuperAdmin@2024
Role: admin
Expected Dashboard: /admin
```

---

## ✅ Success Criteria

### Login is successful when:
1. ✅ User redirected to correct dashboard
2. ✅ Username displays in navbar (not "Guest User")
3. ✅ All localStorage keys populated
4. ✅ API requests work without 401 errors
5. ✅ Token validation succeeds
6. ✅ User can access all features

---

## 🔄 Token Refresh (Optional Enhancement)

Currently tokens expire after 15 minutes. To implement auto-refresh:

```typescript
// In app layout or auth context
useEffect(() => {
  const refreshInterval = setInterval(async () => {
    const refreshToken = localStorage.getItem('admin_refresh_token');
    if (refreshToken) {
      try {
        const response = await authApi.refreshToken(refreshToken);
        authApi.storeAuthData(response);
      } catch (error) {
        // Token refresh failed, logout user
        authApi.logout();
        router.push('/login');
      }
    }
  }, 14 * 60 * 1000); // Refresh every 14 minutes

  return () => clearInterval(refreshInterval);
}, []);
```

---

## 📚 Related Files

### Frontend:
- `User-Pharmacy-Front/lib/auth-api.ts` - Auth API client
- `User-Pharmacy-Front/lib/api.ts` - Main API client
- `User-Pharmacy-Front/app/login/page.tsx` - Login page
- `User-Pharmacy-Front/components/DashboardNavbar.tsx` - Navbar

### Backend:
- `pharmacy-delivery-payment/src/middleware/auth.ts` - Auth middleware
- `pharmacy-delivery-payment/.env` - JWT configuration
- `Admin-Backend/src/modules/auth/routes.ts` - Auth endpoints

---

**Last Updated:** May 3, 2026  
**Status:** ✅ Ready for Testing


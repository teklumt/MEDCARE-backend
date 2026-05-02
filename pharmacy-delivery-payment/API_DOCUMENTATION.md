# Pharmacy Delivery System - API Documentation

**Base URL:** `http://localhost:5000/api/v1`

**Version:** 1.0.0

**Last Updated:** April 2024

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [User Roles](#user-roles)
4. [API Endpoints](#api-endpoints)
5. [Error Handling](#error-handling)
6. [Data Models](#data-models)

---

## Overview

This API provides backend services for a pharmacy delivery system with three user roles: **User** (customers), **Pharmacy** (pharmacy owners), and **Delivery** (delivery personnel).

### Key Features
- JWT-based authentication
- Role-based access control
- Single unified user collection
- Purchase history tracking for users
- License verification for pharmacies
- Real-time order tracking

### Technology Stack
- Node.js + TypeScript
- Express.js
- MongoDB
- JWT Authentication
- Cloudinary (file uploads)

---

## Authentication

### Token Types

**Access Token**
- Expiry: 24 hours
- Usage: Include in `Authorization` header for all protected routes
- Format: `Bearer <token>`

**Refresh Token**
- Expiry: 7 days
- Usage: Get new access token when expired
- Storage: Store securely (httpOnly cookie recommended)

### Headers

All protected endpoints require:
```
Authorization: Bearer <your_access_token>
```

---

## User Roles

### 1. User (Customer)
- Browse pharmacies and medications
- Place orders
- Track deliveries
- View purchase history
- **Status:** Active immediately after signup

### 2. Pharmacy
- Manage inventory
- Process orders
- Manage delivery personnel
- View analytics
- **Status:** Pending verification after signup (requires admin approval)
- **Required:** License image URL

### 3. Delivery
- View assigned deliveries
- Update delivery status
- Track earnings
- **Status:** Active immediately after signup

---

## API Endpoints

### Authentication Endpoints

#### 1. User Signup

**Endpoint:** `POST /auth/user/signup`

**Description:** Register a new customer account

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+251911234567",
  "password": "password123",
  "region": "Addis Ababa",
  "city": "Addis Ababa"
}
```

**Required Fields:**
- `fullName` (string, 2-100 chars)
- `email` (valid email)
- `phone` (Ethiopian format: +251XXXXXXXXX)
- `password` (8-50 chars)

**Optional Fields:**
- `region` (string)
- `city` (string)

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+251911234567",
      "role": "user",
      "region": "Addis Ababa",
      "city": "Addis Ababa",
      "status": "active",
      "isVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Email already registered"
}
```

---

#### 2. Pharmacy Signup

**Endpoint:** `POST /auth/pharmacy/signup`

**Description:** Register a new pharmacy account

**Request Body:**
```json
{
  "fullName": "Abebe Kebede",
  "email": "abebe@pharmacy.com",
  "phone": "+251911234567",
  "password": "password123",
  "businessName": "Abebe Pharmacy",
  "businessNameAmharic": "አበበ ፋርማሲ",
  "licenseNumber": "LIC-2024-001",
  "licenseImageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/pharmacy/licenses/license.jpg",
  "tinNumber": "TIN-123456",
  "address": {
    "region": "Addis Ababa",
    "city": "Addis Ababa",
    "street": "Bole Road",
    "coordinates": {
      "lat": 9.0192,
      "lng": 38.7525
    }
  }
}
```

**Required Fields:**
- `fullName` (string, 2-100 chars)
- `email` (valid email)
- `phone` (Ethiopian format)
- `password` (8-50 chars)
- `businessName` (string, 2-200 chars)
- `licenseNumber` (string)
- `licenseImageUrl` (valid URL) - **Must upload to Cloudinary first**
- `address.region` (string)
- `address.city` (string)
- `address.street` (string)

**Optional Fields:**
- `businessNameAmharic` (string)
- `tinNumber` (string)
- `address.coordinates.lat` (number, -90 to 90)
- `address.coordinates.lng` (number, -180 to 180)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Pharmacy registered successfully. Awaiting verification.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "Abebe Kebede",
      "email": "abebe@pharmacy.com",
      "phone": "+251911234567",
      "role": "pharmacy",
      "businessName": "Abebe Pharmacy",
      "status": "pending_verification",
      "isVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 3. Delivery Signup

**Endpoint:** `POST /auth/delivery/signup`

**Description:** Register a new delivery personnel account

**Request Body:**
```json
{
  "fullName": "Dawit Tesfaye",
  "email": "dawit@delivery.com",
  "phone": "+251922345678",
  "password": "password123",
  "vehicleType": "motorcycle",
  "vehiclePlate": "AA-12345",
  "nationalId": "ID123456",
  "driverLicenseNumber": "DL-2024-001"
}
```

**Required Fields:**
- `fullName` (string, 2-100 chars)
- `email` (valid email)
- `phone` (Ethiopian format)
- `password` (8-50 chars)
- `vehicleType` (enum: 'motorcycle', 'bicycle', 'car')

**Optional Fields:**
- `vehiclePlate` (string)
- `nationalId` (string)
- `driverLicenseNumber` (string)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Delivery account created successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "Dawit Tesfaye",
      "email": "dawit@delivery.com",
      "phone": "+251922345678",
      "role": "delivery",
      "vehicleType": "motorcycle",
      "status": "active",
      "isVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 4. Login

**Endpoint:** `POST /auth/login`

**Description:** Login for all user types

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Required Fields:**
- `email` (valid email)
- `password` (string)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+251911234567",
      "role": "user",
      "status": "active",
      "isVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

Invalid credentials (401):
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

Account suspended (403):
```json
{
  "success": false,
  "error": "Account suspended. Please contact support."
}
```

---

#### 5. Refresh Token

**Endpoint:** `POST /auth/refresh-token`

**Description:** Get new access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid or expired refresh token"
}
```

---

#### 6. Get Profile

**Endpoint:** `GET /auth/profile`

**Description:** Get current user profile

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+251911234567",
    "role": "user",
    "region": "Addis Ababa",
    "city": "Addis Ababa",
    "status": "active",
    "isVerified": true,
    "createdAt": "2024-04-17T10:00:00.000Z",
    "updatedAt": "2024-04-17T10:00:00.000Z"
  }
}
```

---

#### 7. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Logout and invalidate refresh token

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### Error Response Format

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    },
    {
      "field": "phone",
      "message": "Phone must be Ethiopian format: +251XXXXXXXXX"
    }
  ]
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "error": "No token provided. Please login."
}
```

**Authorization Error (403):**
```json
{
  "success": false,
  "error": "Access denied. Required role: pharmacy"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Error message here"
}
```

---

## Data Models

### User Model

**Collection:** `pharmacy-delivery-users`

**Fields:**
```typescript
{
  _id: ObjectId,
  fullName: string,
  email: string,
  phone: string,
  passwordHash: string,
  role: 'user' | 'pharmacy' | 'delivery',
  
  // User specific
  region?: string,
  city?: string,
  
  // Pharmacy specific
  businessName?: string,
  businessNameAmharic?: string,
  licenseNumber?: string,
  licenseImageUrl?: string,
  tinNumber?: string,
  address?: {
    region: string,
    city: string,
    street: string,
    coordinates?: {
      lat: number,
      lng: number
    }
  },
  
  // Delivery specific
  vehicleType?: 'motorcycle' | 'bicycle' | 'car',
  vehiclePlate?: string,
  nationalId?: string,
  driverLicenseNumber?: string,
  assignedPharmacyId?: ObjectId,
  
  // Common
  status: 'active' | 'suspended' | 'pending_verification',
  isVerified: boolean,
  refreshToken?: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Frontend Integration Guide

### 1. Setup Axios Instance

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            'http://localhost:5000/api/v1/auth/refresh-token',
            { refreshToken }
          );
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return axios(error.config);
        } catch (refreshError) {
          // Redirect to login
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. User Signup Example

```javascript
import api from './api';

const userSignup = async (formData) => {
  try {
    const response = await api.post('/auth/user/signup', {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      region: formData.region,
      city: formData.city
    });
    
    // Store tokens
    localStorage.setItem('accessToken', response.data.data.accessToken);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

### 3. Pharmacy Signup with License Upload

```javascript
// Step 1: Upload license to Cloudinary
const uploadLicense = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_upload_preset');
  formData.append('folder', 'pharmacy/licenses');
  
  const response = await fetch(
    'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
    {
      method: 'POST',
      body: formData
    }
  );
  
  const data = await response.json();
  return data.secure_url;
};

// Step 2: Signup with license URL
const pharmacySignup = async (formData, licenseFile) => {
  try {
    // Upload license first
    const licenseImageUrl = await uploadLicense(licenseFile);
    
    // Then signup
    const response = await api.post('/auth/pharmacy/signup', {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      businessName: formData.businessName,
      businessNameAmharic: formData.businessNameAmharic,
      licenseNumber: formData.licenseNumber,
      licenseImageUrl: licenseImageUrl,
      tinNumber: formData.tinNumber,
      address: {
        region: formData.region,
        city: formData.city,
        street: formData.street,
        coordinates: {
          lat: formData.latitude,
          lng: formData.longitude
        }
      }
    });
    
    // Store tokens
    localStorage.setItem('accessToken', response.data.data.accessToken);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

### 4. Login Example

```javascript
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    
    // Store tokens and user data
    localStorage.setItem('accessToken', response.data.data.accessToken);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

### 5. Get Profile Example

```javascript
const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

### 6. Logout Example

```javascript
const logout = async () => {
  try {
    await api.post('/auth/logout');
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirect to login
    window.location.href = '/login';
  } catch (error) {
    // Clear storage anyway
    localStorage.clear();
    window.location.href = '/login';
  }
};
```

---

## Phone Number Validation

Ethiopian phone numbers must follow this format:

**Pattern:** `+251XXXXXXXXX`

**Valid Examples:**
- ✅ `+251911234567`
- ✅ `+251922345678`
- ✅ `+251733456789`

**Invalid Examples:**
- ❌ `0911234567` (missing country code)
- ❌ `251911234567` (missing +)
- ❌ `+251811234567` (invalid prefix, must start with 9 or 7)

**Frontend Validation:**
```javascript
const validateEthiopianPhone = (phone) => {
  const regex = /^\+251[79]\d{8}$/;
  return regex.test(phone);
};
```

---

## Testing with Postman

1. Import `postman_collection.json`
2. Collection includes all endpoints
3. Tokens auto-saved after login/signup
4. Use `{{auth_token}}` variable for protected routes

---

## Support

For issues or questions:
- Check error messages in response
- Verify token is not expired
- Ensure correct role for endpoint
- Check phone number format

---

**Last Updated:** April 2024
**API Version:** 1.0.0
**Backend:** Node.js + TypeScript + MongoDB

# Pharmacy Delivery System - Backend API

Complete backend system for pharmacy delivery platform with JWT authentication, role-based access control, and comprehensive API endpoints.

## Features

- ✅ JWT-based authentication
- ✅ 3 user roles: User (customers), Pharmacy, Delivery
- ✅ Single unified user collection
- ✅ License verification for pharmacies
- ✅ Purchase history tracking
- ✅ Real-time order tracking
- ✅ Cloudinary file uploads
- ✅ TypeScript + Express + MongoDB

## Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment (.env file)
# Add Cloudinary credentials

# Start development server
pnpm dev
```

## API Documentation

See **API_DOCUMENTATION.md** for complete API reference including:
- All authentication endpoints
- Request/response examples
- Frontend integration guide
- Error handling
- Data models

## User Roles

### 1. User (Customer)
- Browse and purchase medications
- Track orders and deliveries
- View purchase history
- **Status:** Active immediately

### 2. Pharmacy
- Manage inventory
- Process orders
- Manage deliveries
- **Status:** Pending verification (requires admin approval)
- **Required:** License image URL

### 3. Delivery
- View assigned deliveries
- Update delivery status
- **Status:** Active immediately

## Authentication Endpoints

- `POST /api/v1/auth/user/signup` - Customer registration
- `POST /api/v1/auth/pharmacy/signup` - Pharmacy registration
- `POST /api/v1/auth/delivery/signup` - Delivery registration
- `POST /api/v1/auth/login` - Login (all roles)
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/profile` - Get user profile (protected)
- `POST /api/v1/auth/logout` - Logout (protected)

## Database

**Collection:** `pharmacy-delivery-users`

All users (customers, pharmacies, delivery personnel) are stored in a single collection with role-based fields.

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PRESCRIPTION_SCAN_WEBHOOK_URL=
MEDCARE_AI_WEBHOOK_URL=https://dawit-sema.dev/webhook/medcare-ai
```

## Testing

Import `postman_collection.json` into Postman for testing all endpoints.

## Tech Stack

- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary
- Joi Validation

## License

MIT

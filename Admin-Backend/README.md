# MED-CARE Ethiopia Admin Backend

Production-ready TypeScript admin backend for MED-CARE Ethiopia.

## Stack
- Node.js + Express.js + TypeScript
- MongoDB + Mongoose
- JWT access token + refresh token
- otplib (TOTP), Resend + nodemailer (SMTP fallback), winston, node-cron
- Jest + Supertest

## Endpoint Count
Total admin endpoints implemented: **54**.

## Prerequisites
- Node.js 18+ installed
- MongoDB 5+ running locally or via Docker
- npm or pnpm package manager

## Quick Setup

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Configure Environment Variables
The `.env` file has been created with defaults. Review and update if needed:
```bash
# Configure required variables in .env
# Key variables:
- MONGO_URI: MongoDB connection string (default: mongodb://localhost:27017/medcare_admin)
- JWT_ACCESS_SECRET: Change from default in production
- JWT_REFRESH_SECRET: Change from default in production
- RESEND_API_KEY / RESEND_FROM: transactional email via Resend (recommended)
- SMTP_*: optional SMTP if Resend is not configured

**Resend:** If sends fail with `validation_error`, `invalid_to`, or similar, confirm the **`to`** address is allowed on your account (sandbox often restricts recipients until you verify a sending domain — check [Resend](https://resend.com/dashboard) Logs). Backend logs include `detail` when a send fails.
```

### 3. Start MongoDB (if not running)
**Option A: Using Docker**
```bash
make db-start
# or
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

**Option B: Using local MongoDB installation**
```bash
# Windows with MongoDB installed
mongod

# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 4. Start Development Server
```bash
npm run dev
# or using Makefile
make dev
```

The server will start on `http://localhost:5000`

### 5. Seed Database (Optional)
To populate with sample data (Super Admin, Admin, User, Pharmacy, Driver, Medicine, Order):
```bash
npm run seed
# or
make seed
```

**Seeded Credentials:**
- Super Admin: `superadmin@medcare-et.com` / `Admin@12345`
- Admin: `admin@medcare-et.com` / `Admin@12345`
- User: `abel.user@medcare-et.com` / `User@12345`
- Pharmacy: `pharmacy1@medcare-et.com` / `Pharmacy@12345`
- Driver: `driver1@medcare-et.com` / `Driver@12345`

## Using Makefile Commands

```bash
# Development
make dev          # Start dev server
make seed         # Seed database
make resetdb      # Reset database completely

# Building & Testing  
make build        # Build TypeScript
make test         # Run tests
make lint         # Run ESLint
make format       # Format code with Prettier

# Docker
make docker-build # Build Docker image
make docker-run   # Run in Docker
make docker-down  # Stop Docker container

# Database
make db-start     # Start MongoDB container
make db-stop      # Stop MongoDB
make db-shell     # Connect to MongoDB shell

# View all commands
make help
```

## API Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Login (Get JWT Token)
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medcare-et.com","password":"Admin@12345"}'
```

### Using Postman
1. Import `postman/MED-CARE-Admin-Backend.postman_collection.json` into Postman
2. Set `{{baseUrl}}` variable to `http://localhost:5000`
3. Run "Login" request to auto-capture access token
4. Use other endpoints with auto-captured token

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env file or run on different port
PORT=5001 npm run dev
```

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
# Windows:
tasklist | findstr mongod

# macOS/Linux:
ps aux | grep mongod

# If not running, start it:
make db-start
```

### TypeScript Compilation Errors
```bash
# Clear cache and reinstall
npm run clean
npm install
npm run build
```

### "Cannot find module" Errors
Ensure all `.ts` imports include `.js` extension (ES module requirement):
```typescript
// ✅ Correct
import { app } from "./app.js"

// ❌ Incorrect
import { app } from "./app"
```

## Build & Production

### Build for Production
```bash
npm run build
```

### Run Production Build
```bash
npm start
# or
node dist/server.js
```

### Docker Deployment
```bash
make docker-build      # Build image
make docker-compose-up  # Run with Docker Compose
```

## Architecture
- Route layer in `src/modules/*/routes.ts`
- Service layer in `src/services/*`
- Repository layer in `src/repositories/*`
- Flexible schema mode enabled for MongoDB models (`strict: false`)

## Postman
- Collection: `postman/MED-CARE-Admin-Backend.postman_collection.json`
- Environment: `postman/MED-CARE-Admin-Backend.postman_environment.json`

## Project Structure
```
src/
├── app.ts                 # Express app setup
├── server.ts              # Server entry point
├── seed.ts                # Database seeding
├── jobs.ts                # Cron jobs
├── config/
│   ├── db.ts              # MongoDB connection
│   └── env.ts             # Environment variables
├── middleware/
│   ├── auth.ts            # JWT authentication
│   ├── errorHandler.ts    # Error handling
│   ├── mfa.ts             # MFA verification
│   ├── rateLimiter.ts     # Rate limiting
│   └── validate.ts        # Request validation
├── models/                # MongoDB schemas
│   ├── Admin.ts
│   ├── EndUser.ts
│   ├── Pharmacy.ts
│   ├── Driver.ts
│   ├── Medicine.ts
│   └── ...
├── modules/               # Feature modules
│   ├── auth/
│   ├── admin-management/
│   ├── user-management/
│   ├── pharmacy-management/
│   ├── driver-management/
│   ├── license-verification/
│   ├── disease-alerts/
│   ├── analytics/
│   └── audit-logs/
├── services/              # Business logic
├── repositories/          # Data access layer
├── types/                 # TypeScript types
└── utils/
    ├── audit.ts           # Audit logging
    ├── logger.ts          # Winston logger
    ├── tokens.ts          # JWT utilities
    └── response.ts        # API response helpers
```

## Docker
- Build image: `docker build -t medcare-admin-api .`
- Start services: `docker compose up -d`

## Default Route Prefix
All admin APIs are under `/api/admin`.

# Quick Setup Guide

## Prerequisites

- Node.js v18+ installed
- pnpm installed (`npm install -g pnpm`)
- MongoDB Atlas account (connection string already configured)
- Cloudinary account

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

The `.env` file is already created. You need to add your Cloudinary credentials:

```env
# Update these in .env file:
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

To get Cloudinary credentials:
1. Go to https://cloudinary.com/
2. Sign up or log in
3. Go to Dashboard
4. Copy Cloud Name, API Key, and API Secret

### 3. Build the Project

```bash
pnpm build
```

### 4. Start Development Server

Using nodemon (recommended - auto-restarts on file changes):
```bash
pnpm dev
```

Alternative with ts-node-dev:
```bash
pnpm dev:ts-node
```

The server will start on http://localhost:5000

**Nodemon Features:**
- Auto-restart when you save files
- Watches all `.ts` and `.json` files in `src/`
- Type `rs` in terminal to manually restart
- 1 second delay to prevent multiple restarts

### 5. Test the API

#### Option A: Using Postman

1. Open Postman
2. Click "Import" button
3. Select the `postman_collection.json` file from the project root
4. The collection will be imported with all endpoints ready to test

#### Option B: Using curl

```bash
# Health check
curl http://localhost:5000/health

# API info
curl http://localhost:5000/api/v1
```

## Postman Collection

The `postman_collection.json` includes:

### 1. Health Check
- Health check endpoint
- API info endpoint

### 2. Inventory Management (7 endpoints)
- Search medications
- Add inventory item
- Get all inventory items (with filters)
- Update inventory item
- Delete inventory item
- Bulk CSV upload
- Get audit log

### 3. Orders Management (5 endpoints)
- Get all orders (with filters)
- Get order details
- Accept order
- Reject order
- Update order status

### 4. Delivery Management (7 endpoints)
- Get all delivery personnel
- Add delivery personnel
- Update delivery personnel
- Deactivate delivery personnel
- Assign delivery
- Get active deliveries
- Get performance metrics
- Confirm cash collection

### 5. Messages/Chat (3 endpoints)
- Get all conversations
- Get conversation messages
- Send message

### 6. Analytics (2 endpoints)
- Get dashboard analytics
- Export report (CSV/PDF)

### 7. Settings (5 endpoints)
- Get pharmacy profile
- Update pharmacy profile
- Update operating hours
- Update delivery settings
- Upload license renewal
- Upload profile image

## Collection Variables

The Postman collection uses these variables (set them in Postman):

- `base_url`: http://localhost:5000/api/v1 (already set)
- `auth_token`: Your JWT token (will be set after authentication)
- `pharmacy_id`: Pharmacy ID for testing
- `medication_id`: Medication ID for testing
- `inventory_id`: Inventory item ID for testing
- `order_id`: Order ID for testing
- `driver_id`: Driver ID for testing
- `session_id`: Chat session ID for testing

## Testing Workflow

1. **Start the server**: `pnpm dev`
2. **Import Postman collection**: Import `postman_collection.json`
3. **Test health check**: Run "Health Check" request
4. **Test API info**: Run "API Info" request
5. **Test other endpoints**: Once controllers are implemented

## Database Connection

The MongoDB connection is already configured:
```
mongodb+srv://finalyeardb:zeERp4eDu5irxjtT@cluster0.0rftqvq.mongodb.net/pharmacy-system
```

Database name: `pharmacy-system`

## Next Steps

After setup, you need to implement:

1. **Authentication middleware** - JWT validation
2. **Route handlers** - Controllers for each endpoint
3. **Business logic** - Services layer
4. **Validation** - Request validation using Joi
5. **WebSocket server** - For real-time chat
6. **Background jobs** - Cron jobs for alerts

## Troubleshooting

### Port already in use
```bash
# Change PORT in .env file
PORT=5001
```

### MongoDB connection failed
- Check your internet connection
- Verify MongoDB URI in .env
- Check MongoDB Atlas IP whitelist

### Cloudinary upload fails
- Verify Cloudinary credentials in .env
- Check file size limits (5MB max)
- Verify file format (jpg, png, pdf)

### TypeScript compilation errors
```bash
# Clean and rebuild
pnpm clean
pnpm build
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm build

# Start development server with nodemon (recommended)
pnpm dev

# Alternative: Start with ts-node-dev
pnpm dev:ts-node

# Start production server
pnpm start

# Watch TypeScript compilation
pnpm watch

# Type check without building
pnpm type-check

# Clean build directory
pnpm clean
```

## Nodemon Configuration

The project uses nodemon for development:
- **Auto-restart**: Automatically restarts when you save files
- **Watch**: Monitors `src/` directory for `.ts` and `.json` files
- **Manual restart**: Type `rs` in terminal
- **Delay**: 1 second delay to prevent multiple restarts
- **Config**: See `nodemon.json` for configuration

## Project Status

✅ Database models created
✅ TypeScript configuration
✅ MongoDB connection
✅ Cloudinary integration
✅ Postman collection
⏳ Controllers (to be implemented)
⏳ Services (to be implemented)
⏳ Authentication (to be implemented)
⏳ Validation (to be implemented)
⏳ WebSocket (to be implemented)
⏳ Background jobs (to be implemented)

## Support

For issues or questions, check:
- README.md for detailed documentation
- project.txt for requirements
- schema.txt for database schema

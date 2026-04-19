# Getting Started with Pharmacy Backend

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Configure Cloudinary

1. Go to https://cloudinary.com/
2. Sign up or log in
3. Go to Dashboard
4. Copy your credentials

Update `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Start Development Server

```bash
pnpm dev
```

You should see:
```
✅ MongoDB Connected: cluster0.0rftqvq.mongodb.net
🚀 Server running on port 5000
📍 Environment: development
🔗 Health check: http://localhost:5000/health
```

### Step 4: Test the API

Open a new terminal and run:
```bash
curl http://localhost:5000/health
```

You should get:
```json
{
  "success": true,
  "message": "Pharmacy Backend API is running",
  "timestamp": "2024-04-17T10:30:00.000Z"
}
```

### Step 5: Import Postman Collection

1. Open Postman
2. Click "Import" button
3. Select `postman_collection.json`
4. Start testing endpoints!

## 📚 Development Workflow

### Running the Server

**Option 1: Nodemon (Recommended)**
```bash
pnpm dev
```
- Auto-restarts on file changes
- Type `rs` to manually restart
- Press `Ctrl+C` to stop

**Option 2: ts-node-dev**
```bash
pnpm dev:ts-node
```
- Alternative development server
- Faster compilation

**Option 3: Production Mode**
```bash
pnpm build
pnpm start
```
- Compiles TypeScript first
- Runs compiled JavaScript

### Making Changes

1. Edit files in `src/` directory
2. Save the file
3. Nodemon automatically restarts
4. Test your changes

Example:
```typescript
// src/server.ts
app.get('/test', (req, res) => {
  res.json({ message: 'Hello World!' });
});
```

Save → Auto-restart → Test at http://localhost:5000/test

### Checking Types

```bash
pnpm type-check
```
- Checks TypeScript types without building
- Useful for finding type errors quickly

### Building for Production

```bash
pnpm build
```
- Compiles TypeScript to JavaScript
- Output in `dist/` directory
- Creates source maps

### Cleaning Build

```bash
pnpm clean
```
- Removes `dist/` directory
- Use before rebuilding

## 🧪 Testing with Postman

### Import Collection

1. Open Postman
2. Click "Import"
3. Select `postman_collection.json`
4. Collection appears in sidebar

### Set Variables

Click on collection → Variables tab:
- `base_url`: http://localhost:5000/api/v1 (already set)
- `auth_token`: (will be set after authentication)
- `pharmacy_id`: (set after creating pharmacy)
- `medication_id`: (set after creating medication)
- `inventory_id`: (set after creating inventory item)
- `order_id`: (set after creating order)
- `driver_id`: (set after creating driver)

### Test Endpoints

Start with Health Check folder:
1. Click "Health Check" request
2. Click "Send"
3. Should get 200 OK response

Then test API Info:
1. Click "API Info" request
2. Click "Send"
3. Should see all available endpoints

## 📁 Project Structure

```
pharmacy-backend/
├── src/
│   ├── config/
│   │   ├── database.ts       # MongoDB connection
│   │   ├── cloudinary.ts     # File upload config
│   │   └── constants.ts      # App constants
│   ├── models/
│   │   ├── User.ts           # Patient model
│   │   ├── Pharmacy.ts       # Pharmacy model
│   │   ├── Admin.ts          # Admin model
│   │   ├── MasterMedication.ts  # Master meds
│   │   ├── Inventory.ts      # Pharmacy inventory
│   │   ├── Order.ts          # Orders
│   │   ├── Driver.ts         # Delivery drivers
│   │   ├── ChatSession.ts    # Chat sessions
│   │   ├── ChatMessage.ts    # Messages
│   │   └── AuditLog.ts       # Audit trail
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── server.ts             # Main entry point
├── dist/                     # Compiled JS (generated)
├── .env                      # Environment variables
├── nodemon.json              # Nodemon config
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
├── postman_collection.json   # API tests
└── sample_inventory.csv      # CSV example
```

## 🔧 Configuration Files

### nodemon.json
```json
{
  "watch": ["src"],           // Watch src directory
  "ext": "ts,json",           // Watch .ts and .json files
  "exec": "ts-node src/server.ts",  // Command to run
  "delay": 1000               // 1 second delay
}
```

### tsconfig.json
- Strict mode enabled
- Compiles to ES2020
- Output to `dist/`
- Source maps enabled

### .env
- MongoDB URI (already configured)
- Cloudinary credentials (add yours)
- JWT secrets
- Port configuration

## 🎯 Next Steps

### 1. Implement Authentication
Create JWT middleware for protected routes

### 2. Create Controllers
Implement request handlers for each endpoint

### 3. Add Services
Business logic layer for operations

### 4. Add Validation
Joi schemas for request validation

### 5. Create Routes
Connect controllers to Express routes

### 6. WebSocket Server
Real-time chat functionality

### 7. Background Jobs
Cron jobs for alerts and cleanup

### 8. Testing
Unit and integration tests

## 💡 Tips & Tricks

### Nodemon Commands
```bash
rs          # Manual restart
Ctrl+C      # Stop server
```

### View Logs
```bash
# Server logs appear in terminal
# MongoDB connection status
# Request logs
# Error messages
```

### Debug Mode
Add to `.env`:
```env
DEBUG=*
```

### Port Already in Use
Change port in `.env`:
```env
PORT=5001
```

### MongoDB Connection Issues
- Check internet connection
- Verify MongoDB URI
- Check IP whitelist in MongoDB Atlas

### Cloudinary Upload Issues
- Verify credentials in `.env`
- Check file size (max 5MB)
- Check file format (jpg, png, pdf)

## 📖 Documentation

- **SETUP.md** - Detailed setup instructions
- **README.md** - Complete project documentation
- **API_DOCUMENTATION.md** - API reference
- **QUICK_REFERENCE.md** - Quick command reference
- **project.txt** - Requirements specification
- **schema.txt** - Database schema

## 🆘 Troubleshooting

### TypeScript Errors
```bash
pnpm type-check    # Check for type errors
pnpm clean         # Clean build
pnpm build         # Rebuild
```

### Module Not Found
```bash
pnpm install       # Reinstall dependencies
```

### Server Won't Start
1. Check if port is available
2. Verify MongoDB connection
3. Check .env file exists
4. Check syntax errors in code

### Postman 404 Errors
- Ensure server is running
- Check base_url variable
- Verify endpoint path

## 🎓 Learning Resources

### TypeScript
- https://www.typescriptlang.org/docs/

### Express.js
- https://expressjs.com/

### MongoDB & Mongoose
- https://mongoosejs.com/docs/

### Cloudinary
- https://cloudinary.com/documentation

### Node.js
- https://nodejs.org/docs/

## ✅ Checklist

Before starting development:
- [ ] pnpm installed
- [ ] Dependencies installed (`pnpm install`)
- [ ] Cloudinary credentials added to `.env`
- [ ] Server starts successfully (`pnpm dev`)
- [ ] Health check works
- [ ] Postman collection imported
- [ ] MongoDB connection successful

You're ready to build! 🚀

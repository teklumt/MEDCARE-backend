# Quick Reference Guide

## Installation & Setup

```bash
# Install dependencies
pnpm install

# Configure Cloudinary in .env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Build
pnpm build

# Start development
pnpm dev

# Start production
pnpm start
```

## Postman Testing

1. Import `postman_collection.json` into Postman
2. Set variables in collection:
   - `base_url`: http://localhost:5000/api/v1
   - `auth_token`: Your JWT token
3. Test endpoints

## Project Structure

```
src/
├── config/          # Database, Cloudinary, constants
├── models/          # Mongoose models (10 models)
├── types/           # TypeScript interfaces
├── routes/          # API routes (to implement)
├── controllers/     # Request handlers (to implement)
├── services/        # Business logic (to implement)
├── middleware/      # Auth, validation (to implement)
├── validators/      # Joi schemas (to implement)
├── jobs/            # Cron jobs (to implement)
├── websocket/       # Socket.io (to implement)
├── utils/           # Helper functions (to implement)
└── server.ts        # Main entry point
```

## Database Models

1. **User** - End users/patients
2. **Pharmacy** - Pharmacy accounts
3. **Admin** - Admin accounts
4. **MasterMedication** - Platform-wide medications
5. **Inventory** - Pharmacy-specific stock
6. **Order** - Patient orders
7. **Driver** - Delivery personnel
8. **ChatSession** - Chat sessions
9. **ChatMessage** - Encrypted messages
10. **AuditLog** - Audit trail

## API Endpoints Summary

### Inventory (7 endpoints)
- `GET /inventory/medications/search` - Search medications
- `POST /inventory` - Add item
- `GET /inventory` - Get all items
- `PUT /inventory/:id` - Update item
- `DELETE /inventory/:id` - Delete item
- `POST /inventory/bulk-upload` - CSV upload
- `GET /inventory/audit-log` - Change log

### Orders (5 endpoints)
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order details
- `POST /orders/:id/accept` - Accept order
- `POST /orders/:id/reject` - Reject order
- `PUT /orders/:id/status` - Update status

### Deliveries (7 endpoints)
- `GET /deliveries/personnel` - Get personnel
- `POST /deliveries/personnel` - Add personnel
- `PUT /deliveries/personnel/:id` - Update personnel
- `DELETE /deliveries/personnel/:id` - Deactivate
- `POST /deliveries/assign` - Assign delivery
- `GET /deliveries/active` - Active deliveries
- `GET /deliveries/metrics` - Performance metrics

### Messages (3 endpoints)
- `GET /messages/conversations` - Get conversations
- `GET /messages/session/:id` - Get messages
- `POST /messages` - Send message

### Analytics (2 endpoints)
- `GET /analytics/dashboard` - Dashboard data
- `POST /analytics/export` - Export report

### Settings (5 endpoints)
- `GET /settings/profile` - Get profile
- `PUT /settings/profile` - Update profile
- `PUT /settings/operating-hours` - Update hours
- `PUT /settings/delivery` - Update delivery settings
- `POST /settings/license` - Upload license

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (already configured)
MONGODB_URI=mongodb+srv://...

# Cloudinary (add yours)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# JWT
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Encryption
ENCRYPTION_KEY=32_byte_key
```

## Common Commands

```bash
# Development
pnpm dev              # Start with nodemon (auto-reload)
pnpm dev:ts-node      # Alternative with ts-node-dev
pnpm watch            # Watch TypeScript compilation

# Production
pnpm build            # Compile TypeScript
pnpm start            # Start server

# Maintenance
pnpm clean            # Clean dist folder
pnpm type-check       # Check types without building
```

## Nodemon Tips

```bash
# Manual restart during development
rs

# Stop server
Ctrl + C

# View nodemon config
cat nodemon.json
```

## Testing Workflow

1. Start server: `pnpm dev`
2. Check health: `curl http://localhost:5000/health`
3. Import Postman collection
4. Test endpoints

## Key Features

✅ TypeScript with strict mode
✅ MongoDB with Mongoose
✅ Cloudinary file uploads
✅ JWT authentication ready
✅ Audit logging
✅ End-to-end encryption support
✅ Pagination & filtering
✅ CSV bulk upload
✅ Real-time chat ready
✅ Background jobs ready

## Next Implementation Steps

1. **Auth Middleware** - JWT validation
2. **Controllers** - Request handlers
3. **Services** - Business logic
4. **Validators** - Joi schemas
5. **Routes** - Connect everything
6. **WebSocket** - Real-time chat
7. **Jobs** - Cron tasks
8. **Tests** - Unit & integration

## File Uploads

### Medication Images
- Folder: `pharmacy/medications`
- Formats: JPG, PNG
- Max size: 5MB
- Transform: 800x800

### Prescriptions
- Folder: `pharmacy/prescriptions`
- Formats: JPG, PNG, PDF
- Max size: 5MB
- Transform: 1200x1600

### Licenses
- Folder: `pharmacy/licenses`
- Formats: JPG, PNG, PDF
- Max size: 5MB

### Profile Images
- Folder: `pharmacy/profiles`
- Formats: JPG, PNG
- Max size: 5MB
- Transform: 400x400 (face crop)

## Status Enums

### Order Status
- pending
- accepted
- rejected
- preparing
- ready
- out_for_delivery
- delivered
- cancelled

### Inventory Status
- available
- out_of_stock
- low_stock
- expiring_soon

### Driver Status
- available
- on_delivery
- offline
- suspended

### Payment Status
- pending
- paid
- failed
- refunded

## Validation Rules

### Price
- Must be positive
- Max 2 decimal places
- Example: 45.50 ✓, 45.555 ✗

### Quantity
- Must be positive integer
- No decimals
- Example: 200 ✓, 200.5 ✗

### Expiry Date
- Must be future date
- Format: YYYY-MM-DD
- Example: 2025-12-31 ✓

### Phone (Ethiopian)
- Format: +251XXXXXXXXX
- Example: +251911234567 ✓

## Performance Requirements

- Medication search: < 200ms
- Order status update: < 2s notification
- Message delivery: < 1s (online)
- Inventory update: < 2s searchable

## Security Features

- Password hashing (bcrypt)
- JWT tokens
- E2E encryption (chat)
- File validation
- Input sanitization
- Audit logging
- CORS enabled

## Troubleshooting

### Port in use
```bash
# Change in .env
PORT=5001
```

### MongoDB connection failed
- Check internet
- Verify URI
- Check IP whitelist

### Cloudinary upload fails
- Verify credentials
- Check file size
- Check file format

### TypeScript errors
```bash
pnpm clean
pnpm build
```

## Resources

- [SETUP.md](SETUP.md) - Detailed setup
- [README.md](README.md) - Full documentation
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- [postman_collection.json](postman_collection.json) - Postman tests
- [sample_inventory.csv](sample_inventory.csv) - CSV example

## Support

MongoDB: Already configured ✅
Cloudinary: Add your credentials ⏳
Postman: Import collection ✅
TypeScript: Configured ✅
Models: Created ✅
Controllers: To implement ⏳

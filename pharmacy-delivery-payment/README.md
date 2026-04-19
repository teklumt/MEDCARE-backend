# Pharmacy Backend System

A comprehensive TypeScript-based backend system for pharmacy management with inventory, orders, deliveries, real-time chat, and analytics.

## Features

- **Inventory Management**: Master medication database with pharmacy-specific inventory
- **Order Processing**: Complete order lifecycle with state machine validation
- **Delivery Management**: Driver assignment, tracking, and performance metrics
- **Real-time Chat**: End-to-end encrypted messaging between patients and pharmacies
- **Analytics**: Revenue tracking, performance metrics, and reporting
- **Audit Logging**: Complete audit trail for all operations

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Cloudinary
- **Real-time**: Socket.io (for chat)
- **Validation**: Joi
- **Authentication**: JWT with bcrypt

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd pharmacy-backend
```

2. Install dependencies (using pnpm)
```bash
pnpm install
```

3. Configure environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI`: Your MongoDB connection string (already configured)
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens

4. Build the TypeScript code
```bash
pnpm build
```

5. Start the development server

Using nodemon (recommended):
```bash
pnpm dev
```

Or using ts-node-dev:
```bash
pnpm dev:ts-node
```

Or start the production server:
```bash
pnpm start
```

## Quick Start

See [SETUP.md](SETUP.md) for detailed setup instructions.

## Testing with Postman

Import the `postman_collection.json` file into Postman to test all API endpoints:

1. Open Postman
2. Click "Import"
3. Select `postman_collection.json`
4. All endpoints will be ready to test

The collection includes 29 pre-configured requests across 6 modules:
- Inventory Management (7 endpoints)
- Orders Management (5 endpoints)
- Delivery Management (7 endpoints)
- Messages/Chat (3 endpoints)
- Analytics (2 endpoints)
- Settings (5 endpoints)

## Project Structure

```
pharmacy-backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts
│   │   ├── cloudinary.ts
│   │   └── constants.ts
│   ├── models/          # Mongoose models
│   │   ├── User.ts
│   │   ├── Pharmacy.ts
│   │   ├── MasterMedication.ts
│   │   ├── Inventory.ts
│   │   ├── Order.ts
│   │   ├── Driver.ts
│   │   ├── ChatSession.ts
│   │   ├── ChatMessage.ts
│   │   ├── AuditLog.ts
│   │   └── Admin.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── routes/          # API routes (to be implemented)
│   ├── controllers/     # Route controllers (to be implemented)
│   ├── services/        # Business logic (to be implemented)
│   ├── middleware/      # Express middleware (to be implemented)
│   ├── validators/      # Request validators (to be implemented)
│   ├── jobs/            # Background jobs (to be implemented)
│   ├── websocket/       # WebSocket server (to be implemented)
│   ├── utils/           # Utility functions (to be implemented)
│   └── server.ts        # Main application entry point
├── dist/                # Compiled JavaScript (generated)
├── .env                 # Environment variables
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## API Endpoints (Planned)

### Inventory
- `GET /api/v1/inventory/medications/search` - Search master medications
- `POST /api/v1/inventory` - Add inventory item
- `GET /api/v1/inventory` - Get all inventory items
- `PUT /api/v1/inventory/:id` - Update inventory item
- `DELETE /api/v1/inventory/:id` - Delete inventory item
- `POST /api/v1/inventory/bulk-upload` - Bulk CSV upload
- `GET /api/v1/inventory/audit-log` - Get change log

### Orders
- `GET /api/v1/orders` - Get all orders
- `GET /api/v1/orders/:id` - Get order details
- `POST /api/v1/orders/:id/accept` - Accept order
- `POST /api/v1/orders/:id/reject` - Reject order
- `PUT /api/v1/orders/:id/status` - Update order status

### Deliveries
- `GET /api/v1/deliveries/personnel` - Get delivery personnel
- `POST /api/v1/deliveries/personnel` - Add delivery personnel
- `PUT /api/v1/deliveries/personnel/:id` - Update personnel
- `DELETE /api/v1/deliveries/personnel/:id` - Deactivate personnel
- `POST /api/v1/deliveries/assign` - Assign delivery
- `GET /api/v1/deliveries/active` - Get active deliveries
- `GET /api/v1/deliveries/metrics` - Get performance metrics

### Messages
- `GET /api/v1/messages/conversations` - Get all conversations
- `GET /api/v1/messages/:sessionId` - Get conversation messages
- `POST /api/v1/messages` - Send message
- WebSocket endpoint for real-time messaging

### Analytics
- `GET /api/v1/analytics/dashboard` - Get dashboard data
- `POST /api/v1/analytics/export` - Export report

### Settings
- `GET /api/v1/settings/profile` - Get pharmacy profile
- `PUT /api/v1/settings/profile` - Update profile
- `PUT /api/v1/settings/operating-hours` - Update hours
- `PUT /api/v1/settings/delivery` - Update delivery settings
- `POST /api/v1/settings/license` - Upload license renewal

## Database Models

### Core Models
- **User**: End users/patients
- **Pharmacy**: Pharmacy accounts
- **Admin**: Admin accounts
- **MasterMedication**: Platform-wide medication database
- **Inventory**: Pharmacy-specific medication inventory
- **Order**: Patient orders
- **Driver**: Delivery personnel
- **ChatSession**: Chat sessions between patients and pharmacies
- **ChatMessage**: Individual chat messages (encrypted)
- **AuditLog**: Audit trail for all operations

## Development

### Build TypeScript
```bash
npm run build
```

### Watch mode (auto-rebuild on changes)
```bash
npm run watch
```

### Development with auto-restart
```bash
npm run dev
```

## Next Steps

1. **Set up Cloudinary account** and add credentials to `.env`
2. **Implement authentication middleware** for JWT validation
3. **Create API routes and controllers** for each module
4. **Implement business logic services**
5. **Add request validation** using Joi
6. **Set up WebSocket server** for real-time chat
7. **Implement background jobs** for alerts and cleanup
8. **Add comprehensive error handling**
9. **Write unit and integration tests**
10. **Add API documentation** (Swagger/OpenAPI)

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- End-to-end encryption for chat messages (AES-256-GCM + RSA-2048)
- File upload validation and size limits
- Input validation on all endpoints
- Audit logging for all sensitive operations
- Rate limiting (to be implemented)
- CORS configuration

## Performance Optimizations

- MongoDB indexes on frequently queried fields
- Pagination for large result sets
- Aggregation pipelines for analytics
- Cloudinary transformations for image optimization
- Connection pooling for database
- Caching strategy (to be implemented)

## License

MIT

## Support

For issues and questions, please open an issue in the repository.

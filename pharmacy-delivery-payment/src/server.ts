import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database';
import authRoutes from './routes/auth.routes';
import inventoryRoutes from './routes/inventory.routes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'Pharmacy Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.use('/api/v1/auth', authRoutes);

// Inventory routes
app.use('/api/v1/inventory', inventoryRoutes);

// API info
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Pharmacy Backend API v1',
    endpoints: {
      auth: {
        pharmacySignup: 'POST /api/v1/auth/pharmacy/signup',
        deliverySignup: 'POST /api/v1/auth/delivery/signup',
        login: 'POST /api/v1/auth/login',
        refreshToken: 'POST /api/v1/auth/refresh-token',
        logout: 'POST /api/v1/auth/logout',
        profile: 'GET /api/v1/auth/profile'
      },
      inventory: '/api/v1/inventory',
      orders: '/api/v1/orders',
      deliveries: '/api/v1/deliveries',
      messages: '/api/v1/messages',
      analytics: '/api/v1/analytics',
      settings: '/api/v1/settings'
    }
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

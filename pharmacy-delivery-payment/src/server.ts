import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database';

// Import models for testing
import Pharmacy from './models/Pharmacy';
import MasterMedication from './models/MasterMedication';
import Inventory from './models/Inventory';
import Order from './models/Order';
import User from './models/User';
import Driver from './models/Driver';

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

// Test routes to view seeded data
app.get('/api/v1/test/pharmacies', async (_req: Request, res: Response) => {
  try {
    const pharmacies = await Pharmacy.find().select('-passwordHash -refreshToken');
    res.json({
      success: true,
      count: pharmacies.length,
      data: pharmacies
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.get('/api/v1/test/medications', async (_req: Request, res: Response) => {
  try {
    const medications = await MasterMedication.find();
    res.json({
      success: true,
      count: medications.length,
      data: medications
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.get('/api/v1/test/inventory', async (_req: Request, res: Response) => {
  try {
    const inventory = await Inventory.find()
      .populate('pharmacyId', 'businessName')
      .populate('medicationId', 'nameEnglish nameAmharic dosageStrength');
    res.json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.get('/api/v1/test/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .populate('patientId', 'fullName phone')
      .populate('pharmacyId', 'businessName')
      .populate('driverId', 'fullName phone');
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.get('/api/v1/test/users', async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select('-passwordHash -refreshToken');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.get('/api/v1/test/drivers', async (_req: Request, res: Response) => {
  try {
    const drivers = await Driver.find()
      .populate('assignedPharmacyId', 'businessName')
      .select('-passwordHash -refreshToken');
    res.json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// API Routes will be added here
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Pharmacy Backend API v1',
    endpoints: {
      inventory: '/api/v1/inventory',
      orders: '/api/v1/orders',
      deliveries: '/api/v1/deliveries',
      messages: '/api/v1/messages',
      analytics: '/api/v1/analytics',
      settings: '/api/v1/settings'
    },
    testEndpoints: {
      pharmacies: '/api/v1/test/pharmacies',
      medications: '/api/v1/test/medications',
      inventory: '/api/v1/test/inventory',
      orders: '/api/v1/test/orders',
      users: '/api/v1/test/users',
      drivers: '/api/v1/test/drivers'
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

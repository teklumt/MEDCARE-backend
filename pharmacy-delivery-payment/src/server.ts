import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import connectDB from './config/database';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import pharmaciesRoutes from './routes/pharmacies.routes';
import pharmacyRoutes from './routes/pharmacy.routes';
import medicationsRoutes from './routes/medications.routes';
import ordersRoutes from './routes/orders.routes';
import paymentsRoutes from './routes/payments.routes';
import commissionRoutes from './routes/commission.routes';
import prescriptionsRoutes from './routes/prescriptions.routes';
import conversationsRoutes from './routes/conversations.routes';
import hospitalsRoutes from './routes/hospitals.routes';
import alertsRoutes from './routes/alerts.routes';
import complaintsRoutes from './routes/complaints.routes';
import searchRoutes from './routes/search.routes';
import deliveryRoutes from './routes/delivery.routes';
import medcareAiRoutes from './routes/medcare-ai.routes';

// Initialize Express app
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploaded prescriptions (local storage)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Basic health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'Pharmacy Backend API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/pharmacies', pharmaciesRoutes);
app.use('/api/v1/pharmacy', pharmacyRoutes);
app.use('/api/v1/medications', medicationsRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/commission', commissionRoutes);
app.use('/api/v1/prescriptions', prescriptionsRoutes);
app.use('/api/v1/conversations', conversationsRoutes);
app.use('/api/v1/hospitals', hospitalsRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/complaints', complaintsRoutes);
app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/medcare-ai', medcareAiRoutes);

// API info
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'MedCare Backend API v1',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      pharmacies: '/api/v1/pharmacies',
      pharmacy: '/api/v1/pharmacy',
      medications: '/api/v1/medications',
      search: '/api/v1/search',
      orders: '/api/v1/orders',
      payments: '/api/v1/payments',
      commission: '/api/v1/commission',
      prescriptions: '/api/v1/prescriptions',
      conversations: '/api/v1/conversations',
      hospitals: '/api/v1/hospitals',
      alerts: '/api/v1/alerts',
      complaints: '/api/v1/complaints',
      delivery: '/api/v1/delivery',
      medcareAi: '/api/v1/medcare-ai'
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

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
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
import notificationsRoutes from './routes/notifications.routes';
import medcareAiRoutes from './routes/medcare-ai.routes';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Pharmacy Backend API is running', timestamp: new Date().toISOString() });
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
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/medcare-ai', medcareAiRoutes);

app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'MedCare Backend API v1' });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: unknown) => {
  res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;

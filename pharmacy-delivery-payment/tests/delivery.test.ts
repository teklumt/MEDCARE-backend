import request from 'supertest';
import app from '../src/app';
import { deliveryToken, patientToken } from './helpers';

jest.mock('../src/config/database', () => jest.fn());

jest.mock('../src/controllers/delivery.controller', () => ({
  getMyDeliveryProfile: jest.fn((req, res) => res.status(200).json({ success: true, data: { profile: { vehicleType: 'motorcycle', isOnline: false } } })),
  getMyDeliveryStatus: jest.fn((req, res) => res.status(200).json({ success: true, data: { isOnline: true } })),
  setMyDeliveryOnlineStatus: jest.fn((req, res) => res.status(200).json({ success: true, data: { isOnline: req.body.isOnline } })),
  getMyAssignedOrders: jest.fn((req, res) => res.status(200).json({ success: true, data: { orders: [{ _id: 'o1' }], total: 1 } })),
  getMyDeliveryHistory: jest.fn((req, res) => res.status(200).json({ success: true, data: { deliveries: [], total: 0 } })),
  getMyDeliveryEarnings: jest.fn((req, res) => res.status(200).json({ success: true, data: { totalEarnings: 500, today: 100 } })),
  startDeliveryTrip: jest.fn((req, res) => res.status(200).json({ success: true, message: 'Trip started' })),
  confirmDriverHandoff: jest.fn((req, res) => res.status(200).json({ success: true, message: 'Handoff confirmed' })),
  updateDriverLocation: jest.fn((req, res) => res.status(200).json({ success: true, message: 'Location updated' })),
  uploadDeliveryProfilePhoto: jest.fn((req, res) => res.status(200).json({ success: true })),
  deleteDeliveryProfilePhoto: jest.fn((req, res) => res.status(200).json({ success: true })),
}));

jest.mock('../src/config/upload', () => ({
  uploadDeliveryProfile: { single: () => (_req: any, _res: any, next: any) => next() },
}));

const BASE = '/api/v1/delivery';

describe('Delivery routes', () => {
  describe('GET /me/profile', () => {
    it('returns delivery driver profile', async () => {
      const res = await request(app)
        .get(`${BASE}/me/profile`)
        .set('Authorization', `Bearer ${deliveryToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data.profile).toHaveProperty('vehicleType');
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get(`${BASE}/me/profile`);
      expect(res.status).toBe(401);
    });

    it('returns 403 for patient role', async () => {
      const res = await request(app)
        .get(`${BASE}/me/profile`)
        .set('Authorization', `Bearer ${patientToken()}`);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /me/status', () => {
    it('returns online status for delivery driver', async () => {
      const res = await request(app)
        .get(`${BASE}/me/status`)
        .set('Authorization', `Bearer ${deliveryToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('isOnline');
    });
  });

  describe('PATCH /me/status', () => {
    it('updates driver online status', async () => {
      const res = await request(app)
        .patch(`${BASE}/me/status`)
        .set('Authorization', `Bearer ${deliveryToken()}`)
        .send({ isOnline: true });
      expect(res.status).toBe(200);
      expect(res.body.data.isOnline).toBe(true);
    });
  });

  describe('GET /me/orders', () => {
    it('returns assigned orders for driver', async () => {
      const res = await request(app)
        .get(`${BASE}/me/orders`)
        .set('Authorization', `Bearer ${deliveryToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('orders');
    });
  });

  describe('GET /me/history', () => {
    it('returns delivery history', async () => {
      const res = await request(app)
        .get(`${BASE}/me/history`)
        .set('Authorization', `Bearer ${deliveryToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('deliveries');
    });
  });

  describe('GET /me/earnings', () => {
    it('returns driver earnings', async () => {
      const res = await request(app)
        .get(`${BASE}/me/earnings`)
        .set('Authorization', `Bearer ${deliveryToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalEarnings');
    });
  });

  describe('PATCH /orders/:id/start-trip', () => {
    it('starts a delivery trip', async () => {
      const res = await request(app)
        .patch(`${BASE}/orders/o1/start-trip`)
        .set('Authorization', `Bearer ${deliveryToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Trip started');
    });
  });

  describe('PATCH /me/location', () => {
    it('updates driver GPS location', async () => {
      const res = await request(app)
        .patch(`${BASE}/me/location`)
        .set('Authorization', `Bearer ${deliveryToken()}`)
        .send({ latitude: 9.0054, longitude: 38.7636 });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Location updated');
    });
  });
});

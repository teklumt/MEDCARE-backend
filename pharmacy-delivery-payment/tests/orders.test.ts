import request from 'supertest';
import app from '../src/app';
import { patientToken, pharmacyToken } from './helpers';

jest.mock('../src/config/database', () => jest.fn());

jest.mock('../src/controllers/orders.controller', () => ({
  createOrder: jest.fn((req, res) => res.status(201).json({
    success: true, data: { order: { _id: 'o1', ref: 'ORD-001', status: 'pending', totalAmount: 150 } },
  })),
  getOrders: jest.fn((req, res) => res.status(200).json({
    success: true, data: { orders: [{ _id: 'o1', ref: 'ORD-001', status: 'pending' }], total: 1 },
  })),
  getOrderById: jest.fn((req, res) => {
    if (req.params.id === 'nonexistent') return res.status(404).json({ success: false });
    return res.status(200).json({ success: true, data: { order: { _id: req.params.id, ref: 'ORD-001' } } });
  }),
  updateOrderStatus: jest.fn((req, res) => res.status(200).json({
    success: true, data: { order: { _id: req.params.id, status: req.body.status } },
  })),
  cancelOrder: jest.fn((req, res) => res.status(200).json({ success: true, message: 'Order cancelled' })),
  completeOrderPayment: jest.fn((req, res) => res.status(200).json({ success: true, data: { checkoutUrl: 'https://chapa.co/checkout' } })),
  confirmPatientReceipt: jest.fn((req, res) => res.status(200).json({ success: true, message: 'Receipt confirmed' })),
  getOrderTracking: jest.fn((req, res) => res.status(200).json({ success: true, data: { statusHistory: [] } })),
}));

const BASE = '/api/v1/orders';

describe('Orders routes', () => {
  describe('POST /', () => {
    it('creates order for authenticated patient', async () => {
      const res = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${patientToken()}`)
        .send({ pharmacyId: '507f1f77bcf86cd799439022', items: [{ medicationId: 'm1', quantity: 2 }], deliveryMethod: 'delivery' });
      expect(res.status).toBe(201);
      expect(res.body.data.order.status).toBe('pending');
    });

    it('returns 401 without auth token', async () => {
      const res = await request(app).post(BASE).send({ pharmacyId: 'p1' });
      expect(res.status).toBe(401);
    });

    it('returns 403 for pharmacy role trying to create order', async () => {
      const res = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${pharmacyToken()}`)
        .send({ pharmacyId: 'p1' });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /', () => {
    it('returns patient orders when authenticated', async () => {
      const res = await request(app)
        .get(BASE)
        .set('Authorization', `Bearer ${patientToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data.orders).toHaveLength(1);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get(BASE);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /:id', () => {
    it('returns order by ID', async () => {
      const res = await request(app)
        .get(`${BASE}/507f1f77bcf86cd799439011`)
        .set('Authorization', `Bearer ${patientToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data.order).toHaveProperty('ref');
    });

    it('returns 404 for non-existent order', async () => {
      const res = await request(app)
        .get(`${BASE}/nonexistent`)
        .set('Authorization', `Bearer ${patientToken()}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /:id/status', () => {
    it('pharmacy can update order status', async () => {
      const res = await request(app)
        .patch(`${BASE}/o1/status`)
        .set('Authorization', `Bearer ${pharmacyToken()}`)
        .send({ status: 'confirmed' });
      expect(res.status).toBe(200);
      expect(res.body.data.order.status).toBe('confirmed');
    });

    it('returns 403 for patient trying to update status', async () => {
      const res = await request(app)
        .patch(`${BASE}/o1/status`)
        .set('Authorization', `Bearer ${patientToken()}`)
        .send({ status: 'confirmed' });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /:id', () => {
    it('patient can cancel their order', async () => {
      const res = await request(app)
        .delete(`${BASE}/o1`)
        .set('Authorization', `Bearer ${patientToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Order cancelled');
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).delete(`${BASE}/o1`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /:id/tracking', () => {
    it('returns order tracking info', async () => {
      const res = await request(app)
        .get(`${BASE}/o1/tracking`)
        .set('Authorization', `Bearer ${patientToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('statusHistory');
    });
  });
});

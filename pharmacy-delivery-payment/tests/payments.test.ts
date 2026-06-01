import request from 'supertest';
import app from '../src/app';
import { patientToken } from './helpers';

jest.mock('../src/config/database', () => jest.fn());

jest.mock('../src/controllers/payments.controller', () => ({
  initiateChapaPayment: jest.fn((req, res) => res.status(200).json({
    success: true, data: { checkoutUrl: 'https://checkout.chapa.co/abc', txRef: 'MC-TXN-001' },
  })),
  chapaWebhook: jest.fn((req, res) => res.status(200).json({ success: true, message: 'Webhook processed' })),
  getPaymentById: jest.fn((req, res) => {
    if (req.params.id === 'nonexistent') return res.status(404).json({ success: false });
    return res.status(200).json({ success: true, data: { payment: { _id: req.params.id, status: 'success', amount: 150 } } });
  }),
  verifyPayment: jest.fn((req, res) => res.status(200).json({ success: true, data: { status: 'success' } })),
}));

const BASE = '/api/v1/payments';

describe('Payments routes', () => {
  describe('POST /chapa/initiate', () => {
    it('returns checkout URL for authenticated patient', async () => {
      const res = await request(app)
        .post(`${BASE}/chapa/initiate`)
        .set('Authorization', `Bearer ${patientToken()}`)
        .send({ orderId: 'o1' });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('checkoutUrl');
      expect(res.body.data).toHaveProperty('txRef');
    });

    it('returns 401 without auth token', async () => {
      const res = await request(app).post(`${BASE}/chapa/initiate`).send({ orderId: 'o1' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /chapa/webhook', () => {
    it('processes webhook without auth', async () => {
      const res = await request(app)
        .post(`${BASE}/chapa/webhook`)
        .send({ tx_ref: 'MC-TXN-001', status: 'success' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /:id', () => {
    it('returns payment by ID for authenticated user', async () => {
      const res = await request(app)
        .get(`${BASE}/507f1f77bcf86cd799439011`)
        .set('Authorization', `Bearer ${patientToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data.payment).toHaveProperty('status');
      expect(res.body.data.payment).toHaveProperty('amount');
    });

    it('returns 404 for non-existent payment', async () => {
      const res = await request(app)
        .get(`${BASE}/nonexistent`)
        .set('Authorization', `Bearer ${patientToken()}`);
      expect(res.status).toBe(404);
    });

    it('returns 401 without auth token', async () => {
      const res = await request(app).get(`${BASE}/507f1f77bcf86cd799439011`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /:id/verify', () => {
    it('verifies payment status', async () => {
      const res = await request(app)
        .get(`${BASE}/507f1f77bcf86cd799439011/verify`)
        .set('Authorization', `Bearer ${patientToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('success');
    });
  });
});

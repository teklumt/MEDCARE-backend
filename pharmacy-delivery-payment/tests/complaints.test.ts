import request from 'supertest';
import app from '../src/app';
import { patientToken, deliveryToken } from './helpers';

jest.mock('../src/config/database', () => jest.fn());

jest.mock('../src/controllers/complaints.controller', () => ({
  createComplaint: jest.fn((_req, res) => res.status(201).json({
    success: true, data: { complaint: { _id: 'c1', ref: 'CMP-001', status: 'open' } },
  })),
  listMyComplaints: jest.fn((_req, res) => res.status(200).json({
    success: true, data: { complaints: [{ _id: 'c1', status: 'open' }], total: 1 },
  })),
  getComplaint: jest.fn((req, res) => {
    if (req.params.id === 'nonexistent') return res.status(404).json({ success: false });
    return res.status(200).json({ success: true, data: { complaint: { _id: req.params.id, status: 'open' } } });
  }),
}));

const BASE = '/api/v1/complaints';

describe('Complaints routes', () => {
  describe('POST /', () => {
    it('creates a complaint for authenticated patient', async () => {
      const res = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${patientToken()}`)
        .send({ targetType: 'pharmacy', targetId: 'p1', issue: 'Wrong medication', details: 'Details here' });
      expect(res.status).toBe(201);
      expect(res.body.data.complaint.status).toBe('open');
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).post(BASE).send({ issue: 'Test' });
      expect(res.status).toBe(401);
    });

    it('returns 403 for delivery role', async () => {
      const res = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${deliveryToken()}`)
        .send({ issue: 'Test' });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /me', () => {
    it('lists my complaints when authenticated', async () => {
      const res = await request(app)
        .get(`${BASE}/me`)
        .set('Authorization', `Bearer ${patientToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data.complaints).toHaveLength(1);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get(`${BASE}/me`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /:id', () => {
    it('returns complaint by ID', async () => {
      const res = await request(app)
        .get(`${BASE}/507f1f77bcf86cd799439011`)
        .set('Authorization', `Bearer ${patientToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data.complaint).toHaveProperty('status');
    });

    it('returns 404 for non-existent complaint', async () => {
      const res = await request(app)
        .get(`${BASE}/nonexistent`)
        .set('Authorization', `Bearer ${patientToken()}`);
      expect(res.status).toBe(404);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get(`${BASE}/c1`);
      expect(res.status).toBe(401);
    });
  });
});

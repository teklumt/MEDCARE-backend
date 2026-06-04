import request from 'supertest';
import app from '../src/app';

jest.mock('../src/config/database', () => jest.fn());

jest.mock('../src/controllers/auth.controller', () => ({
  userSignup: jest.fn((_req, res) => res.status(201).json({ success: true, data: { user: { id: 'u1', role: 'patient' }, tokens: { accessToken: 'tok', refreshToken: 'ref' } } })),
  pharmacySignup: jest.fn((_req, res) => res.status(201).json({ success: true, data: { user: { id: 'p1', role: 'pharmacy' }, tokens: { accessToken: 'tok', refreshToken: 'ref' } } })),
  deliverySignup: jest.fn((_req, res) => res.status(201).json({ success: true, data: { user: { id: 'd1', role: 'delivery' }, tokens: { accessToken: 'tok', refreshToken: 'ref' } } })),
  login: jest.fn((_req, res) => res.status(200).json({ success: true, data: { tokens: { accessToken: 'tok', refreshToken: 'ref' } } })),
  refreshToken: jest.fn((_req, res) => res.status(200).json({ success: true, data: { accessToken: 'new-tok' } })),
  logout: jest.fn((_req, res) => res.status(200).json({ success: true, message: 'Logged out' })),
  getProfile: jest.fn((_req, res) => res.status(200).json({ success: true, data: { user: { id: 'u1', role: 'patient' } } })),
}));

const BASE = '/api/v1/auth';

describe('Auth routes', () => {
  describe('POST /user/signup', () => {
    it('registers a patient with valid data', async () => {
      const res = await request(app).post(`${BASE}/user/signup`).send({
        fullName: 'Test User', email: 'user@test.com', password: 'Pass1234!', phone: '+251911111111',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('patient');
    });

    it('returns 400 on missing required fields', async () => {
      const res = await request(app).post(`${BASE}/user/signup`).send({ email: 'x@x.com' });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /pharmacy/signup', () => {
    it('registers a pharmacy with valid data', async () => {
      const res = await request(app).post(`${BASE}/pharmacy/signup`).send({
        fullName: 'Care Owner', businessName: 'Care Pharmacy', email: 'pharm@test.com',
        password: 'Pass1234!', phone: '+251911222222', licenseNumber: 'BL-001',
        licenseImageUrl: 'https://example.com/license.jpg',
        address: { region: 'Addis Ababa', city: 'Addis Ababa', street: 'Bole Road' },
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('pharmacy');
    });
  });

  describe('POST /delivery/signup', () => {
    it('registers delivery personnel with valid data', async () => {
      const res = await request(app).post(`${BASE}/delivery/signup`).send({
        fullName: 'Courier One', email: 'driver@test.com', password: 'Pass1234!',
        phone: '+251911333333', nationalId: 'ETH-123', vehicleType: 'motorcycle',
        pharmacyId: '507f1f77bcf86cd799439011',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('delivery');
    });
  });

  describe('POST /login', () => {
    it('returns tokens on valid credentials', async () => {
      const res = await request(app).post(`${BASE}/login`).send({ email: 'user@test.com', password: 'Pass1234!' });
      expect(res.status).toBe(200);
      expect(res.body.data.tokens).toHaveProperty('accessToken');
    });

    it('returns 400 on missing email', async () => {
      const res = await request(app).post(`${BASE}/login`).send({ password: 'Pass1234!' });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /refresh-token', () => {
    it('returns new access token', async () => {
      const res = await request(app).post(`${BASE}/refresh-token`).send({ refreshToken: 'valid-refresh' });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
    });
  });

  describe('POST /logout', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app).post(`${BASE}/logout`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /profile', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app).get(`${BASE}/profile`);
      expect(res.status).toBe(401);
    });
  });
});

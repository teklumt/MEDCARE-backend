import request from 'supertest';
import app from '../src/app';

jest.mock('../src/config/database', () => jest.fn());

jest.mock('../src/controllers/hospitals.controller', () => ({
  listHospitals: jest.fn((_req, res) => res.status(200).json({
    success: true,
    data: { hospitals: [{ _id: 'h1', name: 'Tikur Anbessa Hospital', address: 'Addis Ababa' }], total: 1 },
  })),
  getHospitalById: jest.fn((req, res) => {
    if (req.params.id === 'nonexistent') return res.status(404).json({ success: false, message: 'Hospital not found' });
    return res.status(200).json({ success: true, data: { hospital: { _id: req.params.id, name: 'Tikur Anbessa Hospital' } } });
  }),
}));

const BASE = '/api/v1/hospitals';

describe('Hospitals routes', () => {
  describe('GET /', () => {
    it('returns list of hospitals', async () => {
      const res = await request(app).get(BASE);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hospitals).toHaveLength(1);
    });

    it('is a public endpoint — no auth required', async () => {
      const res = await request(app).get(BASE);
      expect(res.status).not.toBe(401);
    });

    it('returns JSON content type', async () => {
      const res = await request(app).get(BASE);
      expect(res.headers['content-type']).toMatch(/json/);
    });

    it('supports search query param', async () => {
      const res = await request(app).get(`${BASE}?search=Tikur`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /:id', () => {
    it('returns a single hospital by ID', async () => {
      const res = await request(app).get(`${BASE}/507f1f77bcf86cd799439011`);
      expect(res.status).toBe(200);
      expect(res.body.data.hospital).toHaveProperty('name');
    });

    it('returns 404 for non-existent hospital', async () => {
      const res = await request(app).get(`${BASE}/nonexistent`);
      expect(res.status).toBe(404);
    });
  });
});

import request from 'supertest';
import app from '../src/app';

jest.mock('../src/config/database', () => jest.fn());

jest.mock('../src/controllers/search.controller', () => ({
  search: jest.fn((req, res) => {
    const q = req.query.q as string;
    if (!q) return res.status(400).json({ success: false, message: 'Query is required' });
    return res.status(200).json({
      success: true,
      data: {
        results: [{ _id: 'm1', name: 'Paracetamol 500mg', pharmacyName: 'Care Pharmacy', price: 25 }],
        total: 1,
      },
    });
  }),
}));

const BASE = '/api/v1/search';

describe('Search routes', () => {
  describe('GET /', () => {
    it('returns medication results for a valid query', async () => {
      const res = await request(app).get(`${BASE}?q=Paracetamol`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.results).toHaveLength(1);
      expect(res.body.data.results[0].name).toMatch(/Paracetamol/);
    });

    it('is a public endpoint — no auth required', async () => {
      const res = await request(app).get(`${BASE}?q=Amoxicillin`);
      expect(res.status).not.toBe(401);
    });

    it('returns 400 when query param is missing', async () => {
      const res = await request(app).get(BASE);
      expect(res.status).toBe(400);
    });

    it('supports category filter', async () => {
      const res = await request(app).get(`${BASE}?q=Paracetamol&category=analgesic`);
      expect(res.status).toBe(200);
    });
  });
});

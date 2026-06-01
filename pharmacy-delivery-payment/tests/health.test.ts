import request from 'supertest';
import app from '../src/app';

jest.mock('../src/config/database', () => jest.fn());

describe('Health endpoint', () => {
  it('returns success payload', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Pharmacy Backend API is running');
  });

  it('includes timestamp in response', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('returns JSON content type', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('returns 404 for unknown route', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1 returns API info', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

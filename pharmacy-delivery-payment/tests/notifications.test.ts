import request from 'supertest';
import app from '../src/app';
import { patientToken } from './helpers';

jest.mock('../src/config/database', () => jest.fn());

jest.mock('../src/controllers/notifications.controller', () => ({
  listNotifications: jest.fn((req, res) => res.status(200).json({
    success: true, data: { notifications: [{ _id: 'n1', title: 'Order confirmed', readAt: null }], total: 1 },
  })),
  markAsRead: jest.fn((req, res) => res.status(200).json({ success: true, message: 'Marked as read' })),
}));

const BASE = '/api/v1/notifications';

describe('Notifications routes', () => {
  describe('GET /', () => {
    it('returns notifications for authenticated user', async () => {
      const res = await request(app)
        .get(BASE)
        .set('Authorization', `Bearer ${patientToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data.notifications).toHaveLength(1);
      expect(res.body.data.notifications[0]).toHaveProperty('title');
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get(BASE);
      expect(res.status).toBe(401);
    });
  });
});

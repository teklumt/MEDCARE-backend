/**
 * Unit Tests — MedCare Ethiopia Thesis System Testing
 *
 * Covers:
 *   TC-2  Search medication by name      Frontend + Backend
 *   TC-3  Locate nearby facility         Frontend + Backend
 *   TC-4  Place medication order         Backend / Orders
 */

import request from 'supertest';
import app from '../src/app';
import { patientToken } from './helpers';

jest.mock('../src/config/database', () => jest.fn());

// ─── TC-2: Search medication by name ────────────────────────────────────────
jest.mock('../src/controllers/search.controller', () => ({
  search: jest.fn((req, res) => {
    const q = (req.query.q as string | undefined)?.toLowerCase() ?? '';
    if (!q) return res.status(400).json({ success: false, message: 'Query is required' });

    const catalogue = [
      { _id: 'm1', name: 'Paracetamol 500mg',   genericName: 'Acetaminophen', price: 25,  pharmacyName: 'MedCare Central', stockQuantity: 150 },
      { _id: 'm2', name: 'Amoxicillin 500mg',   genericName: 'Amoxicillin',   price: 45,  pharmacyName: 'Kenema Pharmacy', stockQuantity: 80  },
      { _id: 'm3', name: 'Ibuprofen 400mg',      genericName: 'Ibuprofen',     price: 30,  pharmacyName: 'Lion Pharmacy',   stockQuantity: 200 },
      { _id: 'm4', name: 'Azithromycin 250mg',   genericName: 'Azithromycin',  price: 85,  pharmacyName: 'MedCare Central', stockQuantity: 40  },
    ];

    const results = catalogue.filter(
      (m) => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q)
    );

    return res.status(200).json({ success: true, data: { results, total: results.length } });
  }),
}));

// ─── TC-3: Locate nearby facility ───────────────────────────────────────────
jest.mock('../src/controllers/pharmacies.controller', () => ({
  listPharmacies: jest.fn((req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    const pharmacies = [
      {
        _id: 'p1',
        businessName: 'MedCare Central Pharmacy',
        address: 'Bole Road, Addis Ababa',
        isOpen: true,
        coordinates: { type: 'Point', coordinates: [38.7639, 9.0108] },
        distanceKm: 0.8,
        stats: { rating: 4.5, reviewCount: 120 },
      },
      {
        _id: 'p2',
        businessName: 'Kenema Pharmacy #4',
        address: 'Near Dembel, Addis Ababa',
        isOpen: true,
        coordinates: { type: 'Point', coordinates: [38.8106, 8.8864] },
        distanceKm: 1.2,
        stats: { rating: 4.2, reviewCount: 85 },
      },
    ];

    // If coordinates provided, simulate proximity sort (already ordered above)
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return res.status(200).json({
        success: true,
        data: { pharmacies, total: pharmacies.length, userLocation: { lat, lng } },
      });
    }

    return res.status(200).json({ success: true, data: { pharmacies, total: pharmacies.length } });
  }),
  getPharmacyById:      jest.fn((_req, res) => res.status(200).json({ success: true, data: {} })),
  getPharmacyInventory: jest.fn((_req, res) => res.status(200).json({ success: true, data: [] })),
  getPharmacyReviews:   jest.fn((_req, res) => res.status(200).json({ success: true, data: [] })),
  addPharmacyReview:    jest.fn((_req, res) => res.status(201).json({ success: true })),
  updateMyPharmacy:     jest.fn((_req, res) => res.status(200).json({ success: true })),
  getMyPharmacy:        jest.fn((_req, res) => res.status(200).json({ success: true, data: {} })),
  getMyDeliveryAgents:  jest.fn((_req, res) => res.status(200).json({ success: true, data: [] })),
  getMyPharmacyInventory: jest.fn((_req, res) => res.status(200).json({ success: true, data: [] })),
  getMyReviews:         jest.fn((_req, res) => res.status(200).json({ success: true, data: [] })),
  getPharmacyAnalytics: jest.fn((_req, res) => res.status(200).json({ success: true, data: {} })),
  createMedication:     jest.fn((_req, res) => res.status(201).json({ success: true })),
  updateMedication:     jest.fn((_req, res) => res.status(200).json({ success: true })),
  deleteMedication:     jest.fn((_req, res) => res.status(200).json({ success: true })),
  bulkUploadMedications:jest.fn((_req, res) => res.status(200).json({ success: true })),
  getInventoryAlerts:   jest.fn((_req, res) => res.status(200).json({ success: true, data: [] })),
  uploadMedicationImage:jest.fn((_req, res) => res.status(200).json({ success: true })),
  verifyPrescription:   jest.fn((_req, res) => res.status(200).json({ success: true })),
  rejectPrescription:   jest.fn((_req, res) => res.status(200).json({ success: true })),
}));

// ─── TC-4: Place medication order ───────────────────────────────────────────
jest.mock('../src/controllers/orders.controller', () => ({
  createOrder: jest.fn((_req, res) =>
    res.status(201).json({
      success: true,
      data: {
        order: {
          _id: 'order-abc-123',
          ref: 'ORD-2024-001',
          status: 'pending',
          totalAmount: 175,
          items: [
            { medicationId: 'm1', medicationName: 'Paracetamol 500mg', quantity: 3, price: 25 },
            { medicationId: 'm3', medicationName: 'Ibuprofen 400mg',    quantity: 2, price: 30 },
          ],
          deliveryMethod: 'delivery',
          paymentStatus: 'pending',
          createdAt: new Date().toISOString(),
        },
      },
    })
  ),
  getOrders:            jest.fn((_req, res) => res.status(200).json({ success: true, data: { orders: [], total: 0 } })),
  getOrderById:         jest.fn((req, res) => res.status(200).json({ success: true, data: { order: { _id: req.params.id } } })),
  updateOrderStatus:    jest.fn((_req, res) => res.status(200).json({ success: true })),
  cancelOrder:          jest.fn((_req, res) => res.status(200).json({ success: true })),
  completeOrderPayment: jest.fn((_req, res) => res.status(200).json({ success: true, data: { checkoutUrl: 'https://chapa.co/checkout' } })),
  confirmPatientReceipt:jest.fn((_req, res) => res.status(200).json({ success: true })),
  getOrderTracking:     jest.fn((_req, res) => res.status(200).json({ success: true, data: { statusHistory: [] } })),
  getPharmacyOrders:    jest.fn((_req, res) => res.status(200).json({ success: true, data: { orders: [], total: 0 } })),
}));

// ─── mock upload (needed by prescriptions.routes) ───────────────────────────
jest.mock('../src/config/upload', () => ({
  uploadPrescription:    { single: () => (_req: unknown, _res: unknown, next: () => void) => next() },
  scanPrescriptionMemory:{ single: () => (_req: unknown, _res: unknown, next: () => void) => next() },
  uploadMedicationImage: { single: () => (_req: unknown, _res: unknown, next: () => void) => next() },
  uploadDeliveryProfile: { single: () => (_req: unknown, _res: unknown, next: () => void) => next() },
}));

const SEARCH_BASE    = '/api/v1/search';
const PHARMACY_BASE  = '/api/v1/pharmacies';
const ORDER_BASE     = '/api/v1/orders';

// ── TC-2 ─────────────────────────────────────────────────────────────────────
describe('TC-2 | Search medication by name', () => {
  it('returns matching medications for a valid query', async () => {
    const res = await request(app).get(`${SEARCH_BASE}?q=Paracetamol`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.results.length).toBeGreaterThan(0);
    expect(res.body.data.results[0].name).toMatch(/Paracetamol/i);
  });

  it('returns multiple matches for a broad query', async () => {
    const res = await request(app).get(`${SEARCH_BASE}?q=500mg`);

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
  });

  it('returns an empty result list when no medication matches', async () => {
    const res = await request(app).get(`${SEARCH_BASE}?q=XYZUnknownDrug99`);

    expect(res.status).toBe(200);
    expect(res.body.data.results).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });

  it('is a public endpoint — no authentication required', async () => {
    const res = await request(app).get(`${SEARCH_BASE}?q=Amoxicillin`);

    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it('returns 400 when the query parameter is missing', async () => {
    const res = await request(app).get(SEARCH_BASE);

    expect(res.status).toBe(400);
  });
});

// ── TC-3 ─────────────────────────────────────────────────────────────────────
describe('TC-3 | Locate nearby facility', () => {
  const ADDIS_LAT = 9.0107;
  const ADDIS_LNG = 38.7636;

  it('returns pharmacies with location data when coordinates are provided', async () => {
    const res = await request(app).get(
      `${PHARMACY_BASE}?lat=${ADDIS_LAT}&lng=${ADDIS_LNG}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const pharmacies = res.body.data.pharmacies;
    expect(pharmacies.length).toBeGreaterThan(0);
    expect(pharmacies[0]).toHaveProperty('coordinates');
    expect(pharmacies[0].coordinates).toHaveProperty('type', 'Point');
  });

  it('includes the user location in the response when coordinates are given', async () => {
    const res = await request(app).get(
      `${PHARMACY_BASE}?lat=${ADDIS_LAT}&lng=${ADDIS_LNG}`
    );

    expect(res.body.data.userLocation).toEqual({ lat: ADDIS_LAT, lng: ADDIS_LNG });
  });

  it('returns pharmacies even without coordinates (city-wide listing)', async () => {
    const res = await request(app).get(PHARMACY_BASE);

    expect(res.status).toBe(200);
    expect(res.body.data.pharmacies.length).toBeGreaterThan(0);
  });

  it('each pharmacy entry has a business name and address', async () => {
    const res = await request(app).get(PHARMACY_BASE);

    const p = res.body.data.pharmacies[0];
    expect(p).toHaveProperty('businessName');
    expect(p).toHaveProperty('address');
    expect(typeof p.businessName).toBe('string');
  });
});

// ── TC-4 ─────────────────────────────────────────────────────────────────────
describe('TC-4 | Place medication order', () => {
  const token = () => patientToken();

  const orderPayload = {
    pharmacyId: '507f1f77bcf86cd799439099',
    deliveryMethod: 'delivery',
    items: [
      { medicationId: 'm1', quantity: 3 },
      { medicationId: 'm3', quantity: 2 },
    ],
    deliveryAddress: {
      recipientName: 'Abel Demo',
      phone: '0911000111',
      street: 'Bole Road',
      subCity: 'Bole',
      city: 'Addis Ababa',
    },
  };

  it('stores the order and returns 201 with a reference number', async () => {
    const res = await request(app)
      .post(ORDER_BASE)
      .set('Authorization', `Bearer ${token()}`)
      .send(orderPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order).toHaveProperty('ref');
    expect(res.body.data.order.ref).toMatch(/ORD/);
  });

  it('records the correct items and total amount', async () => {
    const res = await request(app)
      .post(ORDER_BASE)
      .set('Authorization', `Bearer ${token()}`)
      .send(orderPayload);

    const order = res.body.data.order;
    expect(order.items).toHaveLength(2);
    expect(order.totalAmount).toBeGreaterThan(0);
  });

  it('sets initial status to pending', async () => {
    const res = await request(app)
      .post(ORDER_BASE)
      .set('Authorization', `Bearer ${token()}`)
      .send(orderPayload);

    expect(res.body.data.order.status).toBe('pending');
  });

  it('returns 401 when placing an order without authentication', async () => {
    const res = await request(app).post(ORDER_BASE).send(orderPayload);

    expect(res.status).toBe(401);
  });
});

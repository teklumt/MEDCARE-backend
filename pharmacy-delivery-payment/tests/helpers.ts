import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jest';

export const patientToken = (id = '507f1f77bcf86cd799439011') =>
  jwt.sign({ userId: id, email: 'patient@test.com', role: 'patient' }, SECRET);

export const pharmacyToken = (id = '507f1f77bcf86cd799439022') =>
  jwt.sign({ userId: id, email: 'pharmacy@test.com', role: 'pharmacy' }, SECRET);

export const deliveryToken = (id = '507f1f77bcf86cd799439033') =>
  jwt.sign({ userId: id, email: 'driver@test.com', role: 'delivery' }, SECRET);

export const adminToken = (id = '507f1f77bcf86cd799439044') =>
  jwt.sign({ userId: id, email: 'admin@test.com', role: 'admin' }, SECRET);

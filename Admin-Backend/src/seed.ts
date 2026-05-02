import bcrypt from "bcrypt";
import mongoose, { Types } from "mongoose";
import { connectDB } from "./config/db.js";
import { Admin } from "./models/Admin.js";
import { EndUser } from "./models/EndUser.js";
import { Pharmacy } from "./models/Pharmacy.js";
import { Driver } from "./models/Driver.js";
import { Medicine } from "./models/Medicine.js";
import { Order } from "./models/Order.js";
import { DiseaseAlert } from "./models/DiseaseAlert.js";
import { Review } from "./models/Review.js";
import { AuditLog } from "./models/AuditLog.js";
import { logger } from "./utils/logger.js";

const IDS = {
  superAdmin: new Types.ObjectId("507f1f77bcf86cd799439011"),
  admin: new Types.ObjectId("507f1f77bcf86cd799439012"),
  user: new Types.ObjectId("507f1f77bcf86cd799439014"),
  pharmacy: new Types.ObjectId("507f1f77bcf86cd799439015"),
  medicine: new Types.ObjectId("507f1f77bcf86cd799439016"),
  driver: new Types.ObjectId("507f1f77bcf86cd799439017"),
  alert: new Types.ObjectId("507f1f77bcf86cd799439018"),
  audit: new Types.ObjectId("507f1f77bcf86cd799439019"),
  order: new Types.ObjectId("507f1f77bcf86cd799439020"),
  review: new Types.ObjectId("507f1f77bcf86cd799439021"),
} as const;

const seed = async () => {
  await connectDB();

  const adminPass = await bcrypt.hash("Admin@12345", 12);
  const userPass = await bcrypt.hash("User@12345", 12);
  const pharmacyPass = await bcrypt.hash("Pharmacy@12345", 12);
  const driverPass = await bcrypt.hash("Driver@12345", 12);

  const superAdmin = await Admin.findOneAndUpdate(
    { _id: IDS.superAdmin },
    {
      $set: {
        fullName: "Super Admin",
        email: "superadmin@medcare-et.com",
        passwordHash: adminPass,
        role: "super_admin",
        mfa: { enabled: false },
        status: "active",
        lastLoginAt: new Date(),
        permissions: ["*"],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const admin = await Admin.findOneAndUpdate(
    { _id: IDS.admin },
    {
      $set: {
        fullName: "Platform Admin",
        email: "admin@medcare-et.com",
        passwordHash: adminPass,
        role: "admin",
        mfa: { enabled: false },
        status: "active",
        createdBy: IDS.superAdmin,
        lastLoginAt: new Date(),
        permissions: ["licenses.verify", "users.ban", "pharmacies.manage", "analytics.view"],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const user = await EndUser.findOneAndUpdate(
    { _id: IDS.user },
    {
      $set: {
        fullName: "Abel Demo",
        phone: "+251911000111",
        email: "abel.user@medcare-et.com",
        passwordHash: userPass,
        role: "end_user",
        region: "Addis Ababa",
        city: "Addis Ababa",
        status: "active",
        ban: { isBanned: false },
        warningCount: 0,
        trustScore: 100,
        isVerified: true,
        flags: [],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const pharmacy = await Pharmacy.findOneAndUpdate(
    { _id: IDS.pharmacy },
    {
      $set: {
        businessName: "MED-CARE Pharmacy",
        ownerName: "Selam Owner",
        email: "pharmacy1@medcare-et.com",
        phone: "+251922000222",
        passwordHash: pharmacyPass,
        address: {
          region: "Addis Ababa",
          city: "Addis Ababa",
          street: "Bole Road",
          coordinates: { lat: 8.9806, lng: 38.7578 },
        },
        license: {
          licenseNumber: "LIC-ETH-0001",
          licenseImageUrl: "https://example.com/license1.jpg",
          tinNumber: "TIN-001",
          expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
          status: "verified",
          reviewedBy: IDS.admin,
          reviewedAt: new Date(),
          notes: ["Initial verification completed"],
          verificationHistory: [
            { adminId: IDS.admin, action: "approved", timestamp: new Date() },
          ],
        },
        status: "active",
        isVerifiedBadge: true,
        rating: 4.8,
        totalRatings: 44,
        operatingHours: { open: "08:00", close: "22:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
        mfa: { enabled: false },
        totalOrders: 120,
        totalRevenue: 760000,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const medicine = await Medicine.findOneAndUpdate(
    { _id: IDS.medicine },
    {
      $set: {
        pharmacyId: IDS.pharmacy,
        drugName: "Paracetamol 500mg",
        genericName: "Acetaminophen",
        brand: "MediCetamol",
        category: "Pain Relief",
        stock: {
          quantity: 240,
          unit: "tablet",
          lowThreshold: 20,
          batchNumber: "BTCH-001",
          expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        },
        pricing: {
          costPrice: 2.5,
          sellingPrice: 4.0,
        },
        requiresPrescription: false,
        isAvailable: true,
        lastRestockedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const driver = await Driver.findOneAndUpdate(
    { _id: IDS.driver },
    {
      $set: {
        fullName: "Demo Driver",
        phone: "+251933000333",
        email: "driver1@medcare-et.com",
        passwordHash: driverPass,
        nationalId: "NID-001",
        licenseNumber: "DRV-001",
        licenseImageUrl: "https://example.com/driver-license.jpg",
        vehicle: { type: "motorcycle", plate: "AA-12345" },
        region: "Addis Ababa",
        city: "Addis Ababa",
        assignedPharmacyId: IDS.pharmacy,
        status: "available",
        backgroundCheck: { status: "cleared", reviewedBy: IDS.admin, reviewedAt: new Date() },
        isActive: true,
        isSuspended: false,
        rating: 4.7,
        totalDeliveries: 310,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await Order.findOneAndUpdate(
    { _id: IDS.order },
    {
      $set: {
        orderId: "MC-SEED-0001",
        patientId: IDS.user,
        pharmacyId: IDS.pharmacy,
        driverId: IDS.driver,
        items: [{ medicineId: IDS.medicine, medicineName: medicine.drugName, quantity: 2, priceAtOrder: 4 }],
        totalAmount: 8,
        delivery: {
          method: "delivery",
          address: {
            region: "Addis Ababa",
            city: "Addis Ababa",
            street: "Sarbet",
            coordinates: { lat: 8.991, lng: 38.74 },
          },
        },
        payment: { method: "cash_on_delivery", status: "pending" },
        status: "out_for_delivery",
        statusHistory: [
          { status: "pending", updatedBy: IDS.user, updatedByRole: "end_user", note: "Placed", timestamp: new Date() },
          { status: "accepted", updatedBy: IDS.pharmacy, updatedByRole: "pharmacy", note: "Accepted", timestamp: new Date() },
          { status: "out_for_delivery", updatedBy: IDS.driver, updatedByRole: "driver", note: "Assigned", timestamp: new Date() },
        ],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await DiseaseAlert.findOneAndUpdate(
    { _id: IDS.alert },
    {
      $set: {
        title: "Cholera Outbreak Alert",
        description: "Multiple cholera cases reported. Boil and treat all drinking water before use.",
        alertType: "cholera",
        severity: "high",
        affectedRegions: ["Addis Ababa", "Oromia"],
        affectedCities: ["Addis Ababa", "Adama"],
        createdBy: IDS.admin,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        sentCount: 100,
        deliveredCount: 92,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await Review.findOneAndUpdate(
    { _id: IDS.review },
    {
      $set: {
        pharmacyId: IDS.pharmacy,
        userId: IDS.user,
        rating: 5,
        comment: "Fast delivery and genuine medicine.",
        isFlagged: false,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await AuditLog.findOneAndUpdate(
    { _id: IDS.audit },
    {
      $set: {
        adminId: IDS.admin,
        action: "auth.login",
        targetType: "Admin",
        targetId: String(IDS.admin),
        metadata: { role: "admin" },
        ip: "127.0.0.1",
        userAgent: "PostmanRuntime/7.32.3",
        timestamp: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  logger.info("Seed complete", {
    superAdmin: superAdmin.email,
    admin: admin.email,
    user: user.phone,
    pharmacy: pharmacy.email,
    driver: driver.phone,
    alertId: String(IDS.alert),
    orderId: "MC-SEED-0001",
  });

  await mongoose.connection.close();
};

seed().catch((error) => {
  logger.error("Seed failed", { error });
  process.exit(1);
});

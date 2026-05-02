import bcrypt from "bcrypt";
import mongoose, { Types } from "mongoose";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Pharmacy } from "./models/Pharmacy.js";
import { Driver } from "./models/Driver.js";
import { Medicine } from "./models/Medicine.js";
import { Order } from "./models/Order.js";
import { HealthAlert } from "./models/HealthAlert.js";
import { Review } from "./models/Review.js";
import { AuditLog } from "./models/AuditLog.js";
import { logger } from "./utils/logger.js";

const IDS = {
  superAdmin: new Types.ObjectId("507f1f77bcf86cd799439011"),
  admin: new Types.ObjectId("507f1f77bcf86cd799439012"),
  moderator: new Types.ObjectId("507f1f77bcf86cd799439013"),
  user1: new Types.ObjectId("507f1f77bcf86cd799439014"),
  user2: new Types.ObjectId("507f1f77bcf86cd799439015"),
  user3: new Types.ObjectId("507f1f77bcf86cd799439016"),
  pharmacy1: new Types.ObjectId("507f1f77bcf86cd799439017"),
  pharmacy2: new Types.ObjectId("507f1f77bcf86cd799439018"),
  pharmacy3: new Types.ObjectId("507f1f77bcf86cd799439019"),
  medicine1: new Types.ObjectId("507f1f77bcf86cd799439020"),
  medicine2: new Types.ObjectId("507f1f77bcf86cd799439021"),
  medicine3: new Types.ObjectId("507f1f77bcf86cd799439022"),
  medicine4: new Types.ObjectId("507f1f77bcf86cd799439023"),
  medicine5: new Types.ObjectId("507f1f77bcf86cd799439024"),
  driver1: new Types.ObjectId("507f1f77bcf86cd799439025"),
  driver2: new Types.ObjectId("507f1f77bcf86cd799439026"),
  driver3: new Types.ObjectId("507f1f77bcf86cd799439027"),
  alert1: new Types.ObjectId("507f1f77bcf86cd799439028"),
  alert2: new Types.ObjectId("507f1f77bcf86cd799439029"),
  audit: new Types.ObjectId("507f1f77bcf86cd799439030"),
  order1: new Types.ObjectId("507f1f77bcf86cd799439031"),
  order2: new Types.ObjectId("507f1f77bcf86cd799439032"),
  order3: new Types.ObjectId("507f1f77bcf86cd799439033"),
  review1: new Types.ObjectId("507f1f77bcf86cd799439034"),
  review2: new Types.ObjectId("507f1f77bcf86cd799439035"),
  review3: new Types.ObjectId("507f1f77bcf86cd799439036"),
} as const;

const seed = async () => {
  await connectDB();

  const adminPass = await bcrypt.hash("Admin@12345", 12);
  const userPass = await bcrypt.hash("User@12345", 12);
  const driverPass = await bcrypt.hash("Driver@12345", 12);

  const superAdmin = await User.findOneAndUpdate(
    { _id: IDS.superAdmin },
    {
      $set: {
        username: "super_admin",
        email: "superadmin@medcare-et.com",
        phone: "+251900000001",
        passwordHash: adminPass,
        role: "admin",
        language: "en",
        isActive: true,
        isLocked: false,
        mfa: { enabled: false },
        permissions: ["*"],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const admin = await User.findOneAndUpdate(
    { _id: IDS.admin },
    {
      $set: {
        username: "platform_admin",
        email: "admin@medcare-et.com",
        phone: "+251900000002",
        passwordHash: adminPass,
        role: "admin",
        language: "en",
        isActive: true,
        isLocked: false,
        mfa: { enabled: false },
        permissions: ["*"],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const user = await User.findOneAndUpdate(
    { _id: IDS.user1 },
    {
      $set: {
        username: "abel_demo",
        email: "abel.user@medcare-et.com",
        phone: "+251911000111",
        passwordHash: userPass,
        role: "patient",
        language: "en",
        isActive: true,
        isLocked: false,
        mfa: { enabled: false },
        addresses: [
          {
            label: "Home",
            recipientName: "Abel Demo",
            phone: "0911000111",
            street: "Bole Road",
            subCity: "Bole",
            city: "Addis Ababa",
            additionalInfo: "Near Dembel",
            isDefault: true,
          },
        ],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await User.findOneAndUpdate(
    { _id: IDS.driver1 },
    {
      $set: {
        username: "delivery_demo",
        email: "driver1@medcare-et.com",
        phone: "+251933000333",
        passwordHash: driverPass,
        role: "delivery",
        language: "en",
        isActive: true,
        isLocked: false,
        mfa: { enabled: false },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const pharmacy = await Pharmacy.findOneAndUpdate(
    { _id: IDS.pharmacy1 },
    {
      $set: {
        ownerId: IDS.user1,
        businessName: "MED-CARE Pharmacy",
        location: "Bole, Addis Ababa",
        address: "Bole Road, near Dembel",
        coordinates: { type: "Point", coordinates: [38.7578, 8.9806] },
        phone: "+251922000222",
        email: "pharmacy1@medcare-et.com",
        description: "Demo pharmacy for seed data",
        openingHours: "Open 24 Hours",
        deliveryAvailable: true,
        deliveryFee: 50,
        license: {
          businessLicenseNumber: "LIC-ETH-0001",
          businessLicenseExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
          professionalLicenseExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
        },
        verification: {
          status: "approved",
          verifiedAt: new Date(),
          verifiedById: IDS.admin,
          rejectionNote: null,
          documents: {
            businessRegistration: { url: "https://example.com/license1.jpg", status: "verified", uploadedAt: new Date() },
          },
        },
        stats: { rating: 4.8, reviewCount: 44 },
        isActive: true,
        isOpen: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const medicine = await Medicine.findOneAndUpdate(
    { _id: IDS.medicine1 },
    {
      $set: {
        pharmacyId: IDS.pharmacy1,
        name: "Paracetamol",
        genericName: "Acetaminophen",
        category: "Pain Relief",
        dosageForm: "Tablet",
        strength: "500mg",
        manufacturer: "Demo Pharma",
        batchNumber: "BTCH-001",
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        price: 4.0,
        stockQuantity: 240,
        lowStockThreshold: 20,
        stockStatus: "adequate",
        requiresPrescription: false,
        isActive: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const driver = await Driver.findOneAndUpdate(
    { _id: IDS.driver1 },
    {
      $set: {
        pharmacyId: IDS.pharmacy1,
        vehicleType: "motorcycle",
        isOnline: true,
        stats: { totalDelivered: 310, earnings: { today: 120, thisWeek: 840, thisMonth: 3200 } },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await Order.findOneAndUpdate(
    { _id: IDS.order1 },
    {
      $set: {
        ref: "ORD-SEED-0001",
        patientId: IDS.user1,
        pharmacyId: IDS.pharmacy1,
        deliveryAgentId: IDS.driver1,
        paymentMethod: "cod",
        paymentStatus: "cod_pending",
        deliveryMethod: "delivery",
        deliveryAddress: {
          recipientName: "Abel Demo",
          phone: "0911000111",
          street: "Sarbet",
          subCity: "Lideta",
          city: "Addis Ababa",
          additionalInfo: "Near clinic",
        },
        items: [
          {
            medicationId: IDS.medicine1,
            medicationName: medicine.name,
            genericName: medicine.genericName,
            quantity: 2,
            unitPrice: 4,
            subtotal: 8,
            requiresPrescription: false,
          },
        ],
        subtotal: 8,
        deliveryFee: 50,
        discount: 0,
        totalAmount: 58,
        status: "dispatched",
        statusHistory: [
          { status: "pending", actorId: IDS.user1, createdAt: new Date() },
          { status: "confirmed", actorId: IDS.pharmacy1, createdAt: new Date() },
          { status: "dispatched", actorId: IDS.driver1, createdAt: new Date() },
        ],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await HealthAlert.findOneAndUpdate(
    { _id: IDS.alert1 },
    {
      $set: {
        createdById: IDS.admin,
        type: "Disease Outbreak",
        region: "Addis Ababa",
        message: "Cholera outbreak in Dire Dawa.",
        details: "Boil and treat all drinking water before use.",
        youtubeLink: "https://youtube.com/",
        isActive: true,
        createdAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await Review.findOneAndUpdate(
    { _id: IDS.review1 },
    {
      $set: {
        pharmacyId: IDS.pharmacy1,
        patientId: IDS.user1,
        patientName: "Abel Demo",
        rating: 5,
        comment: "Fast delivery and genuine medicine.",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await AuditLog.findOneAndUpdate(
    { _id: IDS.audit },
    {
      $set: {
        actorId: IDS.admin,
        actorName: "platform_admin",
        action: "auth.login",
        targetType: "User",
        targetId: IDS.admin,
        metadata: { role: "admin" },
        createdAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  logger.info("Seed complete", {
    superAdmin: superAdmin.email,
    admin: admin.email,
    user: user.phone,
    pharmacy: pharmacy.email,
    driver: driver._id.toString(),
    alertId: String(IDS.alert1),
    orderRef: "ORD-SEED-0001",
  });

  await mongoose.connection.close();
};

seed().catch((error) => {
  logger.error("Seed failed", { error });
  process.exit(1);
});

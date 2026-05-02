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
  try {
    await connectDB();
    console.log("🔗 Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Pharmacy.deleteMany({}),
      Driver.deleteMany({}),
      Medicine.deleteMany({}),
      Order.deleteMany({}),
      HealthAlert.deleteMany({}),
      Review.deleteMany({}),
      AuditLog.deleteMany({})
    ]);
    console.log("✅ Cleared existing data");

    // Hash passwords
    const adminPass = await bcrypt.hash("Admin@2024", 12);
    const userPass = await bcrypt.hash("User@2024", 12);
    const driverPass = await bcrypt.hash("Driver@2024", 12);
    const pharmacyPass = await bcrypt.hash("Pharmacy@2024", 12);

    console.log("🔐 Creating admin users...");
    
    // Create Super Admin
    const superAdmin = await User.create({
      _id: IDS.superAdmin,
      username: "super_admin",
      email: "superadmin@medcare-et.com",
      phone: "+251900000001",
      passwordHash: adminPass,
      role: "admin",
      language: "en",
      isActive: true,
      isLocked: false,
      mfa: { enabled: false },
    });

    // Create Admin
    const admin = await User.create({
      _id: IDS.admin,
      username: "platform_admin",
      email: "admin@medcare-et.com",
      phone: "+251900000002",
      passwordHash: adminPass,
      role: "admin",
      language: "en",
      isActive: true,
      isLocked: false,
      mfa: { enabled: false },
    });

    // Create Moderator
    const moderator = await User.create({
      _id: IDS.moderator,
      username: "content_moderator",
      email: "moderator@medcare-et.com",
      phone: "+251900000003",
      passwordHash: adminPass,
      role: "admin",
      language: "en",
      isActive: true,
      isLocked: false,
      mfa: { enabled: false },
    });

    console.log("👤 Creating test users...");
    
    // Create Test Users
    const users = await User.insertMany([
      {
        _id: IDS.user1,
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
            additionalInfo: "Near Dembel City Center",
            isDefault: true,
          },
        ],
      },
      {
        _id: IDS.user2,
        username: "sara_patient",
        email: "sara.patient@medcare-et.com",
        phone: "+251922000222",
        passwordHash: userPass,
        role: "patient",
        language: "en",
        isActive: true,
        isLocked: false,
        mfa: { enabled: false },
        addresses: [
          {
            label: "Home",
            recipientName: "Sara Tesfaye",
            phone: "0922000222",
            street: "Kazanchis",
            subCity: "Kirkos",
            city: "Addis Ababa",
            additionalInfo: "Near Commercial Bank",
            isDefault: true,
          },
        ],
      },
      {
        _id: IDS.user3,
        username: "test_invalid_email",
        email: "invalid-email-format",
        phone: "+251933000333",
        passwordHash: userPass,
        role: "patient",
        language: "am",
        isActive: false,
        isLocked: true,
        lockExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        mfa: { enabled: false },
        addresses: [],
      },
    ]);

    console.log("🏥 Creating pharmacies...");
    
    // Create Pharmacies
    const pharmacies = await Pharmacy.insertMany([
      {
        _id: IDS.pharmacy1,
        ownerId: IDS.user1,
        businessName: "MED-CARE Central Pharmacy",
        location: "Bole, Addis Ababa",
        address: "Bole Road, near Dembel City Center",
        coordinates: { type: "Point", coordinates: [38.7578, 8.9806] },
        phone: "+251911100100",
        email: "central@medcare-pharmacy.com",
        description: "24/7 pharmacy with wide range of medications and medical supplies",
        openingHours: "Open 24 Hours",
        deliveryAvailable: true,
        deliveryFee: 50,
        license: {
          businessLicenseNumber: "LIC-ETH-0001",
          businessLicenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          professionalLicenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
        verification: {
          status: "approved",
          verifiedAt: new Date(),
          verifiedById: IDS.admin,
          rejectionNote: null,
          documents: {
            businessRegistration: { 
              url: "https://example.com/license1.jpg", 
              status: "verified", 
              uploadedAt: new Date() 
            },
          },
        },
        stats: { rating: 4.8, reviewCount: 156 },
        isActive: true,
        isOpen: true,
      },
      {
        _id: IDS.pharmacy2,
        ownerId: IDS.user2,
        businessName: "Bethel Pharmacy",
        location: "Kazanchis, Addis Ababa",
        address: "Kazanchis Street, near Commercial Bank",
        coordinates: { type: "Point", coordinates: [38.7469, 9.0192] },
        phone: "+251922200200",
        email: "bethel@pharmacy.com",
        description: "Specialized in chronic disease medications and consultations",
        openingHours: "Mon-Sat: 8:00 AM - 10:00 PM, Sun: 9:00 AM - 6:00 PM",
        deliveryAvailable: true,
        deliveryFee: 30,
        license: {
          businessLicenseNumber: "LIC-ETH-0002",
          businessLicenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          professionalLicenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
        verification: {
          status: "approved",
          verifiedAt: new Date(),
          verifiedById: IDS.admin,
          rejectionNote: null,
          documents: {
            businessRegistration: { 
              url: "https://example.com/license2.jpg", 
              status: "verified", 
              uploadedAt: new Date() 
            },
          },
        },
        stats: { rating: 4.6, reviewCount: 89 },
        isActive: true,
        isOpen: true,
      },
      {
        _id: IDS.pharmacy3,
        ownerId: IDS.user3,
        businessName: "Pending Verification Pharmacy",
        location: "Merkato, Addis Ababa",
        address: "Merkato Area, Building 123",
        coordinates: { type: "Point", coordinates: [38.7223, 9.0084] },
        phone: "+251933300300",
        email: "pending@pharmacy.com",
        description: "New pharmacy awaiting license verification",
        openingHours: "Mon-Fri: 9:00 AM - 6:00 PM",
        deliveryAvailable: false,
        deliveryFee: 0,
        license: {
          businessLicenseNumber: "LIC-ETH-0003",
          businessLicenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          professionalLicenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
        verification: {
          status: "pending",
          verifiedAt: null,
          verifiedById: null,
          rejectionNote: null,
          documents: {
            businessRegistration: { 
              url: "https://example.com/license3.jpg", 
              status: "pending", 
              uploadedAt: new Date() 
            },
          },
        },
        stats: { rating: 0, reviewCount: 0 },
        isActive: false,
        isOpen: false,
      },
    ]);

    console.log("💊 Creating medicines...");
    
    // Create Medicines
    const medicines = await Medicine.insertMany([
      {
        _id: IDS.medicine1,
        pharmacyId: IDS.pharmacy1,
        name: "Paracetamol",
        genericName: "Acetaminophen",
        category: "Pain Relief",
        dosageForm: "Tablet",
        strength: "500mg",
        manufacturer: "Ethiopian Pharmaceuticals",
        batchNumber: "BTCH-001",
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        price: 4.0,
        stockQuantity: 500,
        lowStockThreshold: 50,
        stockStatus: "adequate",
        requiresPrescription: false,
        isActive: true,
      },
      {
        _id: IDS.medicine2,
        pharmacyId: IDS.pharmacy1,
        name: "Amoxicillin",
        genericName: "Amoxicillin",
        category: "Antibiotic",
        dosageForm: "Capsule",
        strength: "250mg",
        manufacturer: "Cadila Pharmaceuticals",
        batchNumber: "BTCH-002",
        expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        price: 12.5,
        stockQuantity: 200,
        lowStockThreshold: 30,
        stockStatus: "adequate",
        requiresPrescription: true,
        isActive: true,
      },
      {
        _id: IDS.medicine3,
        pharmacyId: IDS.pharmacy2,
        name: "Metformin",
        genericName: "Metformin HCl",
        category: "Diabetes",
        dosageForm: "Tablet",
        strength: "500mg",
        manufacturer: "Julphar Pharmaceuticals",
        batchNumber: "BTCH-003",
        expiryDate: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000),
        price: 8.0,
        stockQuantity: 15,
        lowStockThreshold: 20,
        stockStatus: "low_stock",
        requiresPrescription: true,
        isActive: true,
      },
      {
        _id: IDS.medicine4,
        pharmacyId: IDS.pharmacy2,
        name: "Ibuprofen",
        genericName: "Ibuprofen",
        category: "Pain Relief",
        dosageForm: "Tablet",
        strength: "400mg",
        manufacturer: "Ethiopian Pharmaceuticals",
        batchNumber: "BTCH-004",
        expiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        price: 6.0,
        stockQuantity: 0,
        lowStockThreshold: 25,
        stockStatus: "out_of_stock",
        requiresPrescription: false,
        isActive: false,
      },
      {
        _id: IDS.medicine5,
        pharmacyId: IDS.pharmacy3,
        name: "Expired Medicine Test",
        genericName: "Test Generic",
        category: "Test Category",
        dosageForm: "Tablet",
        strength: "100mg",
        manufacturer: "Test Manufacturer",
        batchNumber: "EXPIRED-001",
        expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Expired 30 days ago
        price: 5.0,
        stockQuantity: 50,
        lowStockThreshold: 10,
        stockStatus: "out_of_stock",
        requiresPrescription: false,
        isActive: false,
      },
    ]);

    console.log("🚚 Creating drivers...");
    
    // Create Driver Users first
    await User.insertMany([
      {
        _id: IDS.driver1,
        username: "delivery_driver_1",
        email: "driver1@medcare-et.com",
        phone: "+251944000444",
        passwordHash: driverPass,
        role: "delivery",
        language: "en",
        isActive: true,
        isLocked: false,
        mfa: { enabled: false },
      },
      {
        _id: IDS.driver2,
        username: "delivery_driver_2",
        email: "driver2@medcare-et.com",
        phone: "+251955000555",
        passwordHash: driverPass,
        role: "delivery",
        language: "am",
        isActive: true,
        isLocked: false,
        mfa: { enabled: false },
      },
      {
        _id: IDS.driver3,
        username: "delivery_driver_3",
        email: "driver3@medcare-et.com",
        phone: "+251966000666",
        passwordHash: driverPass,
        role: "delivery",
        language: "en",
        isActive: false,
        isLocked: false,
        mfa: { enabled: false },
      },
    ]);

    // Create Drivers
    const drivers = await Driver.insertMany([
      {
        _id: IDS.driver1,
        pharmacyId: IDS.pharmacy1,
        vehicleType: "motorcycle",
        isOnline: true,
        stats: { 
          totalDelivered: 245, 
          earnings: { 
            today: 150, 
            thisWeek: 980, 
            thisMonth: 3850 
          } 
        },
      },
      {
        _id: IDS.driver2,
        pharmacyId: IDS.pharmacy2,
        vehicleType: "bicycle",
        isOnline: true,
        stats: { 
          totalDelivered: 89, 
          earnings: { 
            today: 75, 
            thisWeek: 420, 
            thisMonth: 1680 
          } 
        },
      },
      {
        _id: IDS.driver3,
        pharmacyId: IDS.pharmacy1,
        vehicleType: "car",
        isOnline: false,
        stats: { 
          totalDelivered: 156, 
          earnings: { 
            today: 0, 
            thisWeek: 650, 
            thisMonth: 2340 
          } 
        },
      },
    ]);

    console.log("📦 Creating orders...");
    
    // Create Orders
    const orders = await Order.insertMany([
      {
        _id: IDS.order1,
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
          street: "Bole Road",
          subCity: "Bole",
          city: "Addis Ababa",
          additionalInfo: "Near Dembel City Center",
        },
        items: [
          {
            medicationId: IDS.medicine1,
            medicationName: "Paracetamol",
            genericName: "Acetaminophen",
            quantity: 2,
            unitPrice: 4,
            subtotal: 8,
            requiresPrescription: false,
          },
          {
            medicationId: IDS.medicine2,
            medicationName: "Amoxicillin",
            genericName: "Amoxicillin",
            quantity: 1,
            unitPrice: 12.5,
            subtotal: 12.5,
            requiresPrescription: true,
          },
        ],
        subtotal: 20.5,
        deliveryFee: 50,
        discount: 0,
        totalAmount: 70.5,
        status: "delivered",
        statusHistory: [
          { status: "pending", actorId: IDS.user1, createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
          { status: "confirmed", actorId: IDS.pharmacy1, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
          { status: "dispatched", actorId: IDS.driver1, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
          { status: "delivered", actorId: IDS.driver1, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
        ],
      },
      {
        _id: IDS.order2,
        ref: "ORD-SEED-0002",
        patientId: IDS.user2,
        pharmacyId: IDS.pharmacy2,
        deliveryAgentId: IDS.driver2,
        paymentMethod: "chapa",
        paymentStatus: "success",
        deliveryMethod: "delivery",
        deliveryAddress: {
          recipientName: "Sara Tesfaye",
          phone: "0922000222",
          street: "Kazanchis",
          subCity: "Kirkos",
          city: "Addis Ababa",
          additionalInfo: "Near Commercial Bank",
        },
        items: [
          {
            medicationId: IDS.medicine3,
            medicationName: "Metformin",
            genericName: "Metformin HCl",
            quantity: 3,
            unitPrice: 8,
            subtotal: 24,
            requiresPrescription: true,
          },
        ],
        subtotal: 24,
        deliveryFee: 30,
        discount: 5,
        totalAmount: 49,
        status: "dispatched",
        statusHistory: [
          { status: "pending", actorId: IDS.user2, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
          { status: "confirmed", actorId: IDS.pharmacy2, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
          { status: "dispatched", actorId: IDS.driver2, createdAt: new Date(Date.now() - 30 * 60 * 1000) },
        ],
      },
      {
        _id: IDS.order3,
        ref: "ORD-SEED-0003",
        patientId: IDS.user1,
        pharmacyId: IDS.pharmacy2,
        deliveryAgentId: null,
        paymentMethod: "cod",
        paymentStatus: "cod_pending",
        deliveryMethod: "pickup",
        deliveryAddress: null,
        items: [
          {
            medicationId: IDS.medicine4,
            medicationName: "Ibuprofen",
            genericName: "Ibuprofen",
            quantity: 1,
            unitPrice: 6,
            subtotal: 6,
            requiresPrescription: false,
          },
        ],
        subtotal: 6,
        deliveryFee: 0,
        discount: 0,
        totalAmount: 6,
        status: "cancelled",
        statusHistory: [
          { status: "pending", actorId: IDS.user1, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
          { status: "cancelled", actorId: IDS.pharmacy2, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        ],
        cancellationReason: "Medicine out of stock",
      },
    ]);

    console.log("🚨 Creating health alerts...");
    
    // Create Health Alerts
    const alerts = await HealthAlert.insertMany([
      {
        _id: IDS.alert1,
        createdById: IDS.admin,
        type: "Disease Outbreak",
        region: "Addis Ababa",
        message: "Cholera outbreak reported in Dire Dawa region",
        details: "Health authorities advise boiling all drinking water and maintaining proper hygiene. Seek immediate medical attention if experiencing symptoms.",
        youtubeLink: "https://youtube.com/watch?v=health-alert-1",
        isActive: true,
        createdAt: new Date(),
      },
      {
        _id: IDS.alert2,
        createdById: IDS.admin,
        type: "Medication Recall",
        region: "National",
        message: "Recall of contaminated blood pressure medication",
        details: "Batch numbers BP-2024-001 to BP-2024-050 of Amlodipine 5mg tablets are being recalled due to contamination. Return to pharmacy immediately.",
        youtubeLink: "https://youtube.com/watch?v=medication-recall",
        isActive: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ]);

    console.log("⭐ Creating reviews...");
    
    // Create Reviews
    const reviews = await Review.insertMany([
      {
        _id: IDS.review1,
        pharmacyId: IDS.pharmacy1,
        patientId: IDS.user1,
        patientName: "Abel Demo",
        rating: 5,
        comment: "Excellent service! Fast delivery and genuine medications. Highly recommended.",
      },
      {
        _id: IDS.review2,
        pharmacyId: IDS.pharmacy1,
        patientId: IDS.user2,
        patientName: "Sara Tesfaye",
        rating: 4,
        comment: "Good pharmacy with professional staff. Delivery was on time.",
      },
      {
        _id: IDS.review3,
        pharmacyId: IDS.pharmacy2,
        patientId: IDS.user1,
        patientName: "Abel Demo",
        rating: 3,
        comment: "Average service. Medicine was correct but delivery took longer than expected.",
      },
    ]);

    console.log("📋 Creating audit logs...");
    
    // Create Audit Logs
    await AuditLog.insertMany([
      {
        _id: IDS.audit,
        actorId: IDS.admin,
        actorName: "platform_admin",
        action: "auth.login",
        targetType: "User",
        targetId: IDS.admin,
        metadata: { role: "admin", ip: "127.0.0.1" },
        createdAt: new Date(),
      },
      {
        actorId: IDS.superAdmin,
        actorName: "super_admin",
        action: "pharmacy.approve",
        targetType: "Pharmacy",
        targetId: IDS.pharmacy1,
        metadata: { pharmacyName: "MED-CARE Central Pharmacy" },
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        actorId: IDS.admin,
        actorName: "platform_admin",
        action: "user.create",
        targetType: "User",
        targetId: IDS.user1,
        metadata: { userEmail: "abel.user@medcare-et.com" },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ]);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n🔐 ADMIN CREDENTIALS:");
    console.log("Super Admin: superadmin@medcare-et.com / Admin@2024");
    console.log("Admin: admin@medcare-et.com / Admin@2024");
    console.log("Moderator: moderator@medcare-et.com / Admin@2024");
    
    console.log("\n👤 USER CREDENTIALS:");
    console.log("User 1: abel.user@medcare-et.com / User@2024");
    console.log("User 2: sara.patient@medcare-et.com / User@2024");
    console.log("User 3 (Invalid): invalid-email-format / User@2024 (LOCKED)");
    
    console.log("\n🏥 PHARMACY CREDENTIALS:");
    console.log("Pharmacy 1: central@medcare-pharmacy.com / Pharmacy@2024");
    console.log("Pharmacy 2: bethel@pharmacy.com / Pharmacy@2024");
    console.log("Pharmacy 3: pending@pharmacy.com / Pharmacy@2024 (PENDING VERIFICATION)");
    
    console.log("\n🚚 DRIVER CREDENTIALS:");
    console.log("Driver 1: driver1@medcare-et.com / Driver@2024");
    console.log("Driver 2: driver2@medcare-et.com / Driver@2024");
    console.log("Driver 3: driver3@medcare-et.com / Driver@2024 (INACTIVE)");

    console.log("\n📊 SEEDED DATA SUMMARY:");
    console.log(`- ${users.length + 6} Users (including admins & drivers)`);
    console.log(`- ${pharmacies.length} Pharmacies`);
    console.log(`- ${medicines.length} Medicines`);
    console.log(`- ${drivers.length} Drivers`);
    console.log(`- ${orders.length} Orders`);
    console.log(`- ${alerts.length} Health Alerts`);
    console.log(`- ${reviews.length} Reviews`);
    console.log("- 3 Audit Log entries");

    logger.info("Enhanced seed complete", {
      superAdmin: superAdmin.email,
      admin: admin.email,
      moderator: moderator.email,
      usersCount: users.length,
      pharmaciesCount: pharmacies.length,
      medicinesCount: medicines.length,
      driversCount: drivers.length,
      ordersCount: orders.length,
      alertsCount: alerts.length,
      reviewsCount: reviews.length,
    });

  } catch (error) {
    console.error("❌ Seed failed:", error);
    logger.error("Seed failed", { error });
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

seed();
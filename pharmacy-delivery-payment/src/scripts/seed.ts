import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Import models
import User from '../models/User';
import Pharmacy from '../models/Pharmacy';
import Admin from '../models/Admin';
import MasterMedication from '../models/MasterMedication';
import Inventory from '../models/Inventory';
import Order from '../models/Order';
import Driver from '../models/Driver';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Pharmacy.deleteMany({});
    await Admin.deleteMany({});
    await MasterMedication.deleteMany({});
    await Inventory.deleteMany({});
    await Order.deleteMany({});
    await Driver.deleteMany({});
    console.log('✅ Existing data cleared');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Admin
    console.log('👤 Creating admin...');
    const admin = await Admin.create({
      fullName: 'System Admin',
      email: 'admin@pharmacy.com',
      passwordHash: hashedPassword,
      role: 'super_admin',
      status: 'active'
    });
    console.log('✅ Admin created:', admin.email);

    // 2. Create Pharmacies
    console.log('🏥 Creating pharmacies...');
    const pharmacies = await Pharmacy.create([
      {
        businessName: 'Selam Pharmacy',
        nameAmharic: 'ሰላም ፋርማሲ',
        ownerName: 'Abebe Kebede',
        email: 'selam@pharmacy.com',
        phone: '+251911234567',
        passwordHash: hashedPassword,
        description: 'Your trusted healthcare partner in Addis Ababa',
        address: {
          region: 'Addis Ababa',
          city: 'Addis Ababa',
          street: 'Bole Road, near Edna Mall',
          coordinates: {
            lat: 9.0192,
            lng: 38.7525
          }
        },
        license: {
          licenseNumber: 'LIC-2024-001',
          status: 'verified',
          expiryDate: new Date('2025-12-31'),
          reviewedBy: admin._id,
          reviewedAt: new Date()
        },
        status: 'active',
        isVerifiedBadge: true,
        rating: 4.5,
        totalRatings: 120,
        operatingHours: [
          { day: 'monday', isOpen: true, openTime: '08:00', closeTime: '20:00', is24Hours: false },
          { day: 'tuesday', isOpen: true, openTime: '08:00', closeTime: '20:00', is24Hours: false },
          { day: 'wednesday', isOpen: true, openTime: '08:00', closeTime: '20:00', is24Hours: false },
          { day: 'thursday', isOpen: true, openTime: '08:00', closeTime: '20:00', is24Hours: false },
          { day: 'friday', isOpen: true, openTime: '08:00', closeTime: '20:00', is24Hours: false },
          { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '18:00', is24Hours: false },
          { day: 'sunday', isOpen: false, is24Hours: false }
        ],
        deliverySettings: {
          enabled: true,
          radiusKm: 10,
          minOrderForFreeDelivery: 500,
          baseDeliveryFee: 50,
          maxConcurrentDeliveries: 5
        }
      },
      {
        businessName: 'Bethel Pharmacy',
        nameAmharic: 'ቤተል ፋርማሲ',
        ownerName: 'Tigist Alemu',
        email: 'bethel@pharmacy.com',
        phone: '+251922345678',
        passwordHash: hashedPassword,
        description: 'Quality medicines at affordable prices',
        address: {
          region: 'Addis Ababa',
          city: 'Addis Ababa',
          street: 'Piazza, near Arada',
          coordinates: {
            lat: 9.0320,
            lng: 38.7469
          }
        },
        license: {
          licenseNumber: 'LIC-2024-002',
          status: 'verified',
          expiryDate: new Date('2025-12-31'),
          reviewedBy: admin._id,
          reviewedAt: new Date()
        },
        status: 'active',
        isVerifiedBadge: true,
        rating: 4.7,
        totalRatings: 85,
        operatingHours: [
          { day: 'monday', isOpen: true, openTime: '08:00', closeTime: '22:00', is24Hours: false },
          { day: 'tuesday', isOpen: true, openTime: '08:00', closeTime: '22:00', is24Hours: false },
          { day: 'wednesday', isOpen: true, openTime: '08:00', closeTime: '22:00', is24Hours: false },
          { day: 'thursday', isOpen: true, openTime: '08:00', closeTime: '22:00', is24Hours: false },
          { day: 'friday', isOpen: true, openTime: '08:00', closeTime: '22:00', is24Hours: false },
          { day: 'saturday', isOpen: true, openTime: '08:00', closeTime: '22:00', is24Hours: false },
          { day: 'sunday', isOpen: true, openTime: '10:00', closeTime: '20:00', is24Hours: false }
        ],
        deliverySettings: {
          enabled: true,
          radiusKm: 8,
          minOrderForFreeDelivery: 400,
          baseDeliveryFee: 40,
          maxConcurrentDeliveries: 3
        }
      }
    ]);
    console.log('✅ Pharmacies created:', pharmacies.length);

    // 3. Create Users (Patients)
    console.log('👥 Creating users...');
    const users = await User.create([
      {
        fullName: 'John Doe',
        phone: '+251933456789',
        email: 'john@example.com',
        passwordHash: hashedPassword,
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        status: 'active',
        isVerified: true
      },
      {
        fullName: 'Jane Smith',
        phone: '+251944567890',
        email: 'jane@example.com',
        passwordHash: hashedPassword,
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        status: 'active',
        isVerified: true
      },
      {
        fullName: 'Ahmed Hassan',
        phone: '+251955678901',
        passwordHash: hashedPassword,
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        status: 'active',
        isVerified: true
      }
    ]);
    console.log('✅ Users created:', users.length);

    // 4. Create Master Medications
    console.log('💊 Creating master medications...');
    const medications = await MasterMedication.create([
      {
        nameEnglish: 'Amoxicillin',
        nameAmharic: 'አሞክሲሲሊን',
        genericName: 'Amoxicillin',
        dosageStrength: '500mg',
        dosageForm: 'tablet',
        category: 'antibiotic',
        requiresPrescription: true,
        controlledSubstance: false
      },
      {
        nameEnglish: 'Paracetamol',
        nameAmharic: 'ፓራሴታሞል',
        genericName: 'Acetaminophen',
        dosageStrength: '500mg',
        dosageForm: 'tablet',
        category: 'painkiller',
        requiresPrescription: false,
        controlledSubstance: false
      },
      {
        nameEnglish: 'Ibuprofen',
        nameAmharic: 'አይቡፕሮፈን',
        genericName: 'Ibuprofen',
        dosageStrength: '400mg',
        dosageForm: 'tablet',
        category: 'painkiller',
        requiresPrescription: false,
        controlledSubstance: false
      },
      {
        nameEnglish: 'Vitamin C',
        nameAmharic: 'ቪታሚን ሲ',
        genericName: 'Ascorbic Acid',
        dosageStrength: '1000mg',
        dosageForm: 'tablet',
        category: 'vitamin',
        requiresPrescription: false,
        controlledSubstance: false
      },
      {
        nameEnglish: 'Metformin',
        nameAmharic: 'ሜትፎርሚን',
        genericName: 'Metformin',
        dosageStrength: '500mg',
        dosageForm: 'tablet',
        category: 'diabetes',
        requiresPrescription: true,
        controlledSubstance: false
      },
      {
        nameEnglish: 'Omeprazole',
        nameAmharic: 'ኦሜፕራዞል',
        genericName: 'Omeprazole',
        dosageStrength: '20mg',
        dosageForm: 'capsule',
        category: 'chronic_disease',
        requiresPrescription: true,
        controlledSubstance: false
      }
    ]);
    console.log('✅ Master medications created:', medications.length);

    // 5. Create Inventory for Selam Pharmacy
    console.log('📦 Creating inventory...');
    const inventoryItems = await Inventory.create([
      {
        pharmacyId: pharmacies[0]._id,
        medicationId: medications[0]._id,
        stock: {
          quantity: 200,
          lowThreshold: 20,
          batchNumber: 'BATCH-2024-001',
          expiryDate: new Date('2025-12-31')
        },
        pricing: {
          costPrice: 35,
          sellingPrice: 45.50
        },
        supplierName: 'PharmaCorp',
        availability: {
          status: 'available',
          deliveryEligible: true,
          maxOrderQuantity: 50
        },
        prescription: {
          verificationMode: 'manual',
          validityPeriod: 30
        }
      },
      {
        pharmacyId: pharmacies[0]._id,
        medicationId: medications[1]._id,
        stock: {
          quantity: 500,
          lowThreshold: 50,
          batchNumber: 'BATCH-2024-002',
          expiryDate: new Date('2025-11-30')
        },
        pricing: {
          costPrice: 8,
          sellingPrice: 12.00
        },
        supplierName: 'MediSupply',
        availability: {
          status: 'available',
          deliveryEligible: true,
          maxOrderQuantity: 100
        },
        prescription: {
          verificationMode: 'not_required'
        }
      },
      {
        pharmacyId: pharmacies[0]._id,
        medicationId: medications[2]._id,
        stock: {
          quantity: 15,
          lowThreshold: 30,
          batchNumber: 'BATCH-2024-003',
          expiryDate: new Date('2025-10-31')
        },
        pricing: {
          costPrice: 12,
          sellingPrice: 18.50
        },
        supplierName: 'PharmaCorp',
        availability: {
          status: 'low_stock',
          deliveryEligible: true,
          maxOrderQuantity: 50
        },
        prescription: {
          verificationMode: 'not_required'
        }
      },
      {
        pharmacyId: pharmacies[0]._id,
        medicationId: medications[3]._id,
        stock: {
          quantity: 400,
          lowThreshold: 40,
          batchNumber: 'BATCH-2024-004',
          expiryDate: new Date('2026-01-31')
        },
        pricing: {
          costPrice: 18,
          sellingPrice: 25.00
        },
        supplierName: 'HealthPlus',
        availability: {
          status: 'available',
          deliveryEligible: true
        },
        prescription: {
          verificationMode: 'not_required'
        }
      },
      {
        pharmacyId: pharmacies[1]._id,
        medicationId: medications[4]._id,
        stock: {
          quantity: 150,
          lowThreshold: 15,
          batchNumber: 'BATCH-2024-005',
          expiryDate: new Date('2025-09-30')
        },
        pricing: {
          costPrice: 25,
          sellingPrice: 35.00
        },
        supplierName: 'DiabetesCare',
        availability: {
          status: 'available',
          deliveryEligible: true,
          maxOrderQuantity: 30
        },
        prescription: {
          verificationMode: 'manual',
          validityPeriod: 90
        }
      }
    ]);
    console.log('✅ Inventory items created:', inventoryItems.length);

    // 6. Create Drivers
    console.log('🚗 Creating drivers...');
    const drivers = await Driver.create([
      {
        fullName: 'Dawit Tesfaye',
        phone: '+251966789012',
        email: 'dawit@delivery.com',
        passwordHash: hashedPassword,
        nationalId: 'ID123456',
        licenseNumber: 'DL-2024-001',
        vehicle: {
          type: 'motorcycle',
          plate: 'AA-12345'
        },
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        assignedPharmacyId: pharmacies[0]._id,
        status: 'available',
        backgroundCheck: {
          status: 'cleared',
          reviewedBy: admin._id,
          reviewedAt: new Date()
        },
        rating: 4.8,
        totalDeliveries: 45,
        activeDeliveryCount: 0,
        maxConcurrentDeliveries: 5,
        performance: {
          totalDeliveries: 45,
          completedOnTime: 42,
          averageDeliveryTime: 23,
          completionRate: 97.8
        }
      },
      {
        fullName: 'Sara Mohammed',
        phone: '+251977890123',
        passwordHash: hashedPassword,
        vehicle: {
          type: 'bicycle',
          plate: 'AA-54321'
        },
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        assignedPharmacyId: pharmacies[1]._id,
        status: 'available',
        backgroundCheck: {
          status: 'cleared',
          reviewedBy: admin._id,
          reviewedAt: new Date()
        },
        rating: 4.6,
        totalDeliveries: 32,
        activeDeliveryCount: 0,
        maxConcurrentDeliveries: 3,
        performance: {
          totalDeliveries: 32,
          completedOnTime: 28,
          averageDeliveryTime: 28,
          completionRate: 93.8
        }
      }
    ]);
    console.log('✅ Drivers created:', drivers.length);

    // 7. Create Orders
    console.log('📋 Creating orders...');
    const orders = await Order.create([
      {
        patientId: users[0]._id,
        pharmacyId: pharmacies[0]._id,
        items: [
          {
            medicineId: inventoryItems[0]._id,
            medicineName: 'Amoxicillin 500mg',
            quantity: 2,
            priceAtOrder: 45.50
          },
          {
            medicineId: inventoryItems[1]._id,
            medicineName: 'Paracetamol 500mg',
            quantity: 1,
            priceAtOrder: 12.00
          }
        ],
        totalAmount: 103.00,
        delivery: {
          method: 'delivery',
          address: {
            region: 'Addis Ababa',
            city: 'Addis Ababa',
            street: 'Kazanchis, near British Embassy',
            coordinates: {
              lat: 9.0227,
              lng: 38.7636
            }
          }
        },
        payment: {
          method: 'cash_on_delivery',
          status: 'pending'
        },
        status: 'pending',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date()
          }
        ]
      },
      {
        patientId: users[1]._id,
        pharmacyId: pharmacies[0]._id,
        driverId: drivers[0]._id,
        items: [
          {
            medicineId: inventoryItems[3]._id,
            medicineName: 'Vitamin C 1000mg',
            quantity: 3,
            priceAtOrder: 25.00
          }
        ],
        totalAmount: 75.00,
        delivery: {
          method: 'delivery',
          address: {
            region: 'Addis Ababa',
            city: 'Addis Ababa',
            street: 'Megenagna, near Shola Market',
            coordinates: {
              lat: 9.0155,
              lng: 38.7897
            }
          }
        },
        payment: {
          method: 'cash_on_delivery',
          status: 'pending'
        },
        status: 'out_for_delivery',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 3600000)
          },
          {
            status: 'accepted',
            timestamp: new Date(Date.now() - 3000000)
          },
          {
            status: 'preparing',
            timestamp: new Date(Date.now() - 2400000)
          },
          {
            status: 'out_for_delivery',
            timestamp: new Date(Date.now() - 1800000)
          }
        ],
        estimatedPreparationTime: 30,
        estimatedDeliveryTime: new Date(Date.now() + 1800000)
      },
      {
        patientId: users[2]._id,
        pharmacyId: pharmacies[1]._id,
        items: [
          {
            medicineId: inventoryItems[4]._id,
            medicineName: 'Metformin 500mg',
            quantity: 1,
            priceAtOrder: 35.00
          }
        ],
        totalAmount: 35.00,
        delivery: {
          method: 'pickup'
        },
        payment: {
          method: 'chapa',
          status: 'paid',
          transactionId: 'TXN-2024-001'
        },
        status: 'ready',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 1800000)
          },
          {
            status: 'accepted',
            timestamp: new Date(Date.now() - 1200000)
          },
          {
            status: 'preparing',
            timestamp: new Date(Date.now() - 900000)
          },
          {
            status: 'ready',
            timestamp: new Date(Date.now() - 300000)
          }
        ]
      }
    ]);
    console.log('✅ Orders created:', orders.length);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Admins: 1`);
    console.log(`   - Pharmacies: ${pharmacies.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Master Medications: ${medications.length}`);
    console.log(`   - Inventory Items: ${inventoryItems.length}`);
    console.log(`   - Drivers: ${drivers.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Admin: admin@pharmacy.com / password123');
    console.log('   Pharmacy 1: selam@pharmacy.com / password123');
    console.log('   Pharmacy 2: bethel@pharmacy.com / password123');
    console.log('   User 1: john@example.com / password123');
    console.log('   Driver 1: dawit@delivery.com / password123');

    // Disconnect
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();

# Seed Database & Test Guide

## 🌱 Seeding the Database

### Step 1: Run the Seed Script

```bash
pnpm seed
```

This will:
1. Connect to MongoDB
2. Clear existing data
3. Create test data:
   - 1 Admin
   - 2 Pharmacies (Selam & Bethel)
   - 3 Users (Patients)
   - 6 Master Medications
   - 5 Inventory Items
   - 2 Delivery Drivers
   - 3 Orders (pending, out_for_delivery, ready)

### Step 2: Verify Seeding

You should see output like:
```
🌱 Starting database seeding...
✅ Connected to MongoDB
🗑️  Clearing existing data...
✅ Existing data cleared
👤 Creating admin...
✅ Admin created: admin@pharmacy.com
🏥 Creating pharmacies...
✅ Pharmacies created: 2
👥 Creating users...
✅ Users created: 3
💊 Creating master medications...
✅ Master medications created: 6
📦 Creating inventory...
✅ Inventory items created: 5
🚗 Creating drivers...
✅ Drivers created: 2
📋 Creating orders...
✅ Orders created: 3

🎉 Database seeding completed successfully!

📊 Summary:
   - Admins: 1
   - Pharmacies: 2
   - Users: 3
   - Master Medications: 6
   - Inventory Items: 5
   - Drivers: 2
   - Orders: 3

🔑 Test Credentials:
   Admin: admin@pharmacy.com / password123
   Pharmacy 1: selam@pharmacy.com / password123
   Pharmacy 2: bethel@pharmacy.com / password123
   User 1: john@example.com / password123
   Driver 1: dawit@delivery.com / password123

✅ Disconnected from MongoDB
```

## 🧪 Testing with Postman

### Step 1: Start the Server

```bash
pnpm dev
```

### Step 2: Import Updated Postman Collection

1. Open Postman
2. Click "Import"
3. Select `postman_collection.json`
4. The collection now includes a "Test Data (Seeded)" folder

### Step 3: Test the Seeded Data

Run these requests in order:

#### 1. Health Check
- Request: `GET http://localhost:5000/health`
- Expected: `200 OK` with success message

#### 2. Get All Pharmacies
- Request: `GET http://localhost:5000/api/v1/test/pharmacies`
- Expected: 2 pharmacies (Selam & Bethel)

#### 3. Get All Medications
- Request: `GET http://localhost:5000/api/v1/test/medications`
- Expected: 6 medications (Amoxicillin, Paracetamol, etc.)

#### 4. Get All Inventory
- Request: `GET http://localhost:5000/api/v1/test/inventory`
- Expected: 5 inventory items with populated pharmacy and medication data

#### 5. Get All Orders
- Request: `GET http://localhost:5000/api/v1/test/orders`
- Expected: 3 orders with different statuses

#### 6. Get All Users
- Request: `GET http://localhost:5000/api/v1/test/users`
- Expected: 3 users (patients)

#### 7. Get All Drivers
- Request: `GET http://localhost:5000/api/v1/test/drivers`
- Expected: 2 drivers with performance metrics

## 📊 Seeded Data Details

### Pharmacies

**Selam Pharmacy**
- Email: selam@pharmacy.com
- Phone: +251911234567
- Location: Bole Road, Addis Ababa
- Status: Verified
- Rating: 4.5/5
- Delivery: Enabled (10km radius)

**Bethel Pharmacy**
- Email: bethel@pharmacy.com
- Phone: +251922345678
- Location: Piazza, Addis Ababa
- Status: Verified
- Rating: 4.7/5
- Delivery: Enabled (8km radius)

### Medications

1. **Amoxicillin 500mg** (Antibiotic) - Requires prescription
2. **Paracetamol 500mg** (Painkiller) - No prescription
3. **Ibuprofen 400mg** (Painkiller) - No prescription
4. **Vitamin C 1000mg** (Vitamin) - No prescription
5. **Metformin 500mg** (Diabetes) - Requires prescription
6. **Omeprazole 20mg** (Chronic disease) - Requires prescription

### Inventory

**Selam Pharmacy:**
- Amoxicillin: 200 units @ ETB 45.50
- Paracetamol: 500 units @ ETB 12.00
- Ibuprofen: 15 units @ ETB 18.50 (LOW STOCK)
- Vitamin C: 400 units @ ETB 25.00

**Bethel Pharmacy:**
- Metformin: 150 units @ ETB 35.00

### Orders

**Order 1 (Pending)**
- Patient: John Doe
- Pharmacy: Selam
- Items: Amoxicillin (2), Paracetamol (1)
- Total: ETB 103.00
- Delivery: Cash on delivery
- Status: Pending

**Order 2 (Out for Delivery)**
- Patient: Jane Smith
- Pharmacy: Selam
- Driver: Dawit Tesfaye
- Items: Vitamin C (3)
- Total: ETB 75.00
- Delivery: Cash on delivery
- Status: Out for delivery

**Order 3 (Ready for Pickup)**
- Patient: Ahmed Hassan
- Pharmacy: Bethel
- Items: Metformin (1)
- Total: ETB 35.00
- Payment: Paid via Chapa
- Status: Ready

### Users (Patients)

1. **John Doe** - +251933456789 - john@example.com
2. **Jane Smith** - +251944567890 - jane@example.com
3. **Ahmed Hassan** - +251955678901

### Drivers

**Dawit Tesfaye**
- Phone: +251966789012
- Vehicle: Motorcycle (AA-12345)
- Pharmacy: Selam
- Rating: 4.8/5
- Deliveries: 45 completed
- On-time rate: 93.3%

**Sara Mohammed**
- Phone: +251977890123
- Vehicle: Bicycle (AA-54321)
- Pharmacy: Bethel
- Rating: 4.6/5
- Deliveries: 32 completed
- On-time rate: 87.5%

## 🔄 Re-seeding

To clear and re-seed the database:

```bash
pnpm seed
```

This will delete all existing data and create fresh test data.

## 🧪 Testing Scenarios

### Scenario 1: View Pharmacy Inventory
1. Get all pharmacies
2. Copy a pharmacy ID
3. Get inventory filtered by that pharmacy

### Scenario 2: Track Order Status
1. Get all orders
2. Find an order with "out_for_delivery" status
3. Note the driver assigned
4. Get driver details

### Scenario 3: Check Low Stock Items
1. Get all inventory
2. Look for items with status "low_stock"
3. Ibuprofen should show as low stock (15 units, threshold 30)

### Scenario 4: View Order History
1. Get all orders
2. Check statusHistory array
3. See the progression: pending → accepted → preparing → out_for_delivery

## 📝 Using cURL

If you prefer command line:

```bash
# Health check
curl http://localhost:5000/health

# Get pharmacies
curl http://localhost:5000/api/v1/test/pharmacies

# Get medications
curl http://localhost:5000/api/v1/test/medications

# Get inventory
curl http://localhost:5000/api/v1/test/inventory

# Get orders
curl http://localhost:5000/api/v1/test/orders

# Get users
curl http://localhost:5000/api/v1/test/users

# Get drivers
curl http://localhost:5000/api/v1/test/drivers
```

## 🎯 Next Steps

After verifying the seeded data:

1. Implement authentication endpoints
2. Add protected routes
3. Implement inventory management endpoints
4. Add order management endpoints
5. Create delivery management endpoints

## 🐛 Troubleshooting

### Seed script fails
- Check MongoDB connection in `.env`
- Ensure server is not running (stop with Ctrl+C)
- Check for syntax errors in seed.ts

### No data returned
- Ensure seed script completed successfully
- Check server is running (`pnpm dev`)
- Verify MongoDB connection

### Duplicate key errors
- Run seed script again (it clears data first)
- Or manually clear collections in MongoDB

## 📚 Test Credentials

All passwords are: `password123`

**Admin:**
- Email: admin@pharmacy.com

**Pharmacies:**
- Selam: selam@pharmacy.com
- Bethel: bethel@pharmacy.com

**Users:**
- John: john@example.com
- Jane: jane@example.com
- Ahmed: +251955678901 (no email)

**Drivers:**
- Dawit: dawit@delivery.com
- Sara: +251977890123 (no email)

---

Happy Testing! 🚀

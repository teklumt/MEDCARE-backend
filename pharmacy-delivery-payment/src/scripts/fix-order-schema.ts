import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixOrderSchema = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Check if orders collection exists
    const collections = await db.listCollections({ name: 'orders' }).toArray();
    
    if (collections.length > 0) {
      console.log('📦 Found orders collection');
      
      // Count existing orders
      const count = await db.collection('orders').countDocuments();
      console.log(`📊 Current orders count: ${count}`);
      
      if (count > 0) {
        console.log('⚠️  WARNING: This will delete all existing orders!');
        console.log('💡 If you want to keep existing orders, press Ctrl+C now');
        console.log('⏳ Waiting 5 seconds...');
        
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // Drop the collection
      console.log('🗑️  Dropping orders collection...');
      await db.collection('orders').drop();
      console.log('✅ Orders collection dropped');
    } else {
      console.log('ℹ️  No orders collection found (this is fine)');
    }

    // Drop the payments collection too (it references orders)
    const paymentCollections = await db.listCollections({ name: 'payments' }).toArray();
    if (paymentCollections.length > 0) {
      console.log('🗑️  Dropping payments collection...');
      await db.collection('payments').drop();
      console.log('✅ Payments collection dropped');
    }

    console.log('');
    console.log('✅ Schema fix complete!');
    console.log('📝 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Try creating an order again');
    console.log('   3. The new schema will be used automatically');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixOrderSchema();

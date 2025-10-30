
require('dotenv').config();

console.log('==========================================');
console.log('Environment Check:');
console.log('==========================================');
console.log('MONGO_URI from .env:', process.env.MONGO_URI);
console.log('==========================================\n');

const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      console.log('❌ ERROR: MONGO_URI is not defined in .env file!');
      process.exit(1);
    }
    
    if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
      console.log('⚠️  WARNING: You are using local MongoDB, not Atlas!');
    } else if (uri.includes('mongodb+srv://')) {
      console.log('✅ Using MongoDB Atlas connection');
    }
    
    console.log('\nAttempting to connect...\n');
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ SUCCESS! MongoDB Connected');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection Failed!');
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testConnection();
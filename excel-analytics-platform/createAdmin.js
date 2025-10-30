const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/excel-analytics', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@platform.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Delete and recreate if needed
      console.log('\nDeleting existing admin and creating fresh one...');
      await User.deleteOne({ email: 'admin@platform.com' });
    }

    // Create new admin user
    const adminData = {
      name: 'System Administrator',
      email: 'admin@platform.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    };

    const admin = await User.create(adminData);
    
    console.log('\n🎉 SUCCESS! Admin user created:');
    console.log('=====================================');
    console.log('Email:    admin@platform.com');
    console.log('Password: admin123');
    console.log('Role:     admin');
    console.log('=====================================');
    console.log('\n✅ You can now login with these credentials!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
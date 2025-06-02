const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB directly
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const createFixedAdmin = async () => {
  try {
    // Use the users collection directly to avoid any model middleware
    const db = mongoose.connection;
    await db.once('open', () => console.log('DB connection ready'));
    
    const usersCollection = db.collection('users');
    
    // Delete any existing admin
    console.log('Removing existing admin accounts...');
    await usersCollection.deleteMany({ email: 'admin@facility.com' });
    
    // Create a hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create the admin user directly in MongoDB
    const adminUser = {
      name: 'System Administrator',
      email: 'admin@facility.com',
      password: hashedPassword,
      role: 'systemAdmin',
      createdAt: new Date()
    };
    
    console.log('Creating new admin with direct database insertion...');
    const result = await usersCollection.insertOne(adminUser);
    
    if (result.acknowledged) {
      console.log('Admin account created successfully!');
      console.log(`ID: ${result.insertedId}`);
      console.log('Email: admin@facility.com');
      console.log('Password: admin123');
      console.log('Hashed password: ' + hashedPassword);
      
      // Verify the password works with bcrypt
      const storedUser = await usersCollection.findOne({ email: 'admin@facility.com' });
      const passwordCheck = await bcrypt.compare('admin123', storedUser.password);
      console.log(`Password verification: ${passwordCheck ? 'PASSED ✓' : 'FAILED ✗'}`);
    }
    
    console.log('\nPlease try logging in with:');
    console.log('Email: admin@facility.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createFixedAdmin();

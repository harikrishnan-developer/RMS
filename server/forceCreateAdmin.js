const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB directly without using the model
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for direct database operations'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const createAdmin = async () => {
  try {
    // Get the User collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Delete any existing admin user first
    console.log('Removing any existing admin accounts...');
    await usersCollection.deleteMany({ email: 'admin@facility.com' });
    
    // Generate a salt and hash the password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Insert the admin user directly into the database
    const adminUser = {
      name: 'System Administrator',
      email: 'admin@facility.com',
      password: hashedPassword,
      role: 'systemAdmin',
      createdAt: new Date()
    };
    
    console.log('Creating new admin account with hashed password...');
    const result = await usersCollection.insertOne(adminUser);
    
    if (result.acknowledged) {
      console.log('Admin account created successfully!');
      console.log('Email: admin@facility.com');
      console.log('Password: admin123');
      console.log('Hashed password in database:', hashedPassword);
      
      // Verify the password match using bcrypt directly
      const passwordMatches = await bcrypt.compare('admin123', hashedPassword);
      console.log('Password verification test:', passwordMatches ? 'PASSED ✓' : 'FAILED ✗');
    } else {
      console.error('Failed to create admin account');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin account:', error);
    process.exit(1);
  }
};

createAdmin();

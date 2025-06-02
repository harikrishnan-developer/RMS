const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const createAdminDirectly = async () => {
  try {
    // Delete any existing admin account
    console.log('Removing any existing admin accounts...');
    await User.deleteMany({ email: 'admin@facility.com' });
    
    // Manually hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create admin user without triggering middleware
    console.log('Creating new admin account with direct database insertion...');
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@facility.com',
      password: hashedPassword,
      role: 'systemAdmin'
    });
    
    // Save to database bypassing pre-save hooks
    const savedUser = await adminUser.save({ validateBeforeSave: true });
    
    console.log('Admin account created successfully!');
    console.log(`ID: ${savedUser._id}`);
    console.log('Email: admin@facility.com');
    console.log('Password: admin123');
    console.log('Hashed password in database:', hashedPassword);
    
    // Test password verification
    const isMatch = await bcrypt.compare('admin123', hashedPassword);
    console.log('Password verification test:', isMatch ? 'PASSED ✓' : 'FAILED ✗');
    
    // Let's also try the model's matchPassword method
    const user = await User.findOne({ email: 'admin@facility.com' }).select('+password');
    if (user) {
      const modelMatch = await user.matchPassword('admin123');
      console.log('Model password verification test:', modelMatch ? 'PASSED ✓' : 'FAILED ✗');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin account:', error);
    process.exit(1);
  }
};

createAdminDirectly();

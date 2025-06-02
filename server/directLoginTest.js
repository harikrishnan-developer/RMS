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

const testLogin = async () => {
  try {
    console.log('Retrieving admin user...');
    const user = await User.findOne({ email: 'admin@facility.com' }).select('+password');
    
    if (!user) {
      console.error('Admin user not found!');
      process.exit(1);
    }
    
    console.log('User found:');
    console.log(`ID: ${user._id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password hash: ${user.password}`);
    
    // Test password verification with bcrypt directly
    const plainPassword = 'admin123';
    const directMatch = await bcrypt.compare(plainPassword, user.password);
    console.log(`\nDirect bcrypt verification for "${plainPassword}": ${directMatch ? 'PASSED ✓' : 'FAILED ✗'}`);
    
    // Update the user with a fresh password that we know will work
    console.log('\nUpdating user with a fresh password...');
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(plainPassword, salt);
    
    user.password = newHashedPassword;
    await user.save({ validateBeforeSave: true });
    
    console.log('Password updated!');
    console.log(`New password hash: ${newHashedPassword}`);
    
    // Verify the updated password
    const updatedUser = await User.findOne({ email: 'admin@facility.com' }).select('+password');
    const finalCheck = await bcrypt.compare(plainPassword, updatedUser.password);
    console.log(`\nFinal verification check: ${finalCheck ? 'PASSED ✓' : 'FAILED ✗'}`);
    
    console.log('\nPlease try logging in with:');
    console.log('Email: admin@facility.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing login:', error);
    process.exit(1);
  }
};

testLogin();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected for seeding'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// System Admin data
const systemAdminData = {
  name: 'System Administrator',
  email: 'admin@facility.com',
  password: 'admin123', // This will be hashed by the pre-save middleware
  role: 'systemAdmin'
};

// Function to seed the System Admin
const seedSystemAdmin = async () => {
  try {
    // Check if System Admin already exists
    const adminExists = await User.findOne({ email: systemAdminData.email });
    
    if (adminExists) {
      console.log('System Admin already exists');
      process.exit(0);
    }
    
    // Create new System Admin
    const systemAdmin = new User(systemAdminData);
    
    // Save to database (password will be automatically hashed by the pre-save hook)
    await systemAdmin.save();
    
    console.log('System Admin created successfully:');
    console.log(`Name: ${systemAdmin.name}`);
    console.log(`Email: ${systemAdmin.email}`);
    console.log(`Role: ${systemAdmin.role}`);
    console.log('Password: admin123 (Please change this after first login)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding System Admin:', error);
    process.exit(1);
  }
};

// Run the seed function
seedSystemAdmin();

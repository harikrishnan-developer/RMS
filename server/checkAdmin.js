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
.then(() => console.log('MongoDB Connected for checking admin'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Function to check the System Admin
const checkSystemAdmin = async () => {
  try {
    // Find the System Admin user
    const admin = await User.findOne({ email: 'admin@facility.com' }).select('+password');
    
    if (!admin) {
      console.log('System Admin does not exist');
      process.exit(0);
    }
    
    console.log('System Admin exists:');
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Password: ${admin.password}`); // Will show the hashed password
    
    // Create a new admin with manually hashed password
    console.log('\nCreating a new admin with manually hashed password...');
    
    // Delete the existing admin first
    await User.deleteOne({ email: 'admin@facility.com' });
    
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create new admin with manually hashed password
    const newAdmin = new User({
      name: 'System Administrator',
      email: 'admin@facility.com',
      password: hashedPassword,
      role: 'systemAdmin'
    });
    
    await newAdmin.save();
    
    console.log('New System Admin created successfully:');
    console.log(`Name: ${newAdmin.name}`);
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Role: ${newAdmin.role}`);
    console.log(`Password: ${newAdmin.password}`);
    console.log('Password: admin123 (Please change this after first login)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking/creating System Admin:', error);
    process.exit(1);
  }
};

// Run the check function
checkSystemAdmin();

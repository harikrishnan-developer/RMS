require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding block heads'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Block head data
const blockHeads = [
  {
    name: 'John Smith',
    email: 'john.smith@facility.com',
    password: 'password123',
    role: 'blockHead'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@facility.com',
    password: 'password123',
    role: 'blockHead'
  }
];

// Function to seed block heads
const seedBlockHeads = async () => {
  try {
    // Check if any block heads already exist
    const existingBlockHeads = await User.find({ role: 'blockHead' });
    console.log(`Found ${existingBlockHeads.length} existing block heads`);

    if (existingBlockHeads.length === 0) {
      // Create new block heads
      const createdBlockHeads = await User.create(blockHeads);
      console.log(`Created ${createdBlockHeads.length} block heads`);
    } else {
      console.log('Block heads already exist, skipping creation');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error seeding block heads:', error);
    process.exit(1);
  }
};

// Run the seed function
seedBlockHeads(); 
const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Create a debug express app
const app = express();

// Apply middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Debug middleware to log request
app.use((req, res, next) => {
  console.log('\n------------------------------');
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('------------------------------\n');
  next();
});

// Debug login route
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Debug login route accessed');
    
    // Extract credentials from request body
    const { email, password } = req.body;
    console.log('Parsed email:', email);
    console.log('Parsed password:', password);
    
    // Validate email & password
    if (!email || !password) {
      console.log('Email or password missing');
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }
    
    // Get user from database directly
    const user = await mongoose.connection.collection('users').findOne({ email });
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    console.log('User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      passwordHash: user.password
    });
    
    // Check password match with bcrypt directly
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    console.log('Login successful!');
    
    // Create a simple token (not using JWT here for debugging)
    const token = 'debug_token_' + Date.now();
    
    // Send successful response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Start server on a different port to avoid conflicts
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log(`Test login by sending POST request to http://localhost:${PORT}/api/auth/login`);
  console.log('Credentials: email=admin@facility.com, password=admin123');
});

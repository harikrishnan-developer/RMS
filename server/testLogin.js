const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing login API...');
    
    const userData = {
      email: 'admin@facility.com',
      password: 'admin123'
    };
    
    console.log('Login request data:', JSON.stringify(userData));
    
    const response = await axios.post('http://localhost:5000/api/auth/login', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login response status:', response.status);
    console.log('Login response data:', JSON.stringify(response.data, null, 2));
    
    console.log('Login test successful!');
  } catch (error) {
    console.error('Login test failed!');
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
};

testLogin();

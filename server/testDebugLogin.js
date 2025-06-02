const axios = require('axios');

const testDebugLogin = async () => {
  try {
    console.log('Testing debug login API...');
    
    const loginData = {
      email: 'admin@facility.com',
      password: 'admin123'
    };
    
    console.log('Sending login request with data:', JSON.stringify(loginData));
    
    const response = await axios.post('http://localhost:5001/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('SUCCESS! Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('FAILED! Status:', error.response?.status);
    console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error details:', error.message);
  }
};

testDebugLogin();

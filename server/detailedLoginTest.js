const axios = require('axios');

const testLoginFormats = async () => {
  try {
    console.log('Testing login API with different request formats...');
    const baseUrl = 'http://localhost:5000/api/auth/login';
    
    // Test different formats of login requests
    const testCases = [
      {
        description: "Standard format",
        data: {
          email: "admin@facility.com",
          password: "admin123"
        },
        headers: {
          'Content-Type': 'application/json'
        }
      },
      {
        description: "With JSON.stringify",
        data: JSON.stringify({
          email: "admin@facility.com",
          password: "admin123"
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      },
      {
        description: "With x-www-form-urlencoded content type",
        data: {
          email: "admin@facility.com",
          password: "admin123"
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    ];
    
    // Run all test cases
    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.description} ---`);
      console.log('Request data:', typeof testCase.data === 'string' ? testCase.data : JSON.stringify(testCase.data));
      console.log('Headers:', JSON.stringify(testCase.headers));
      
      try {
        const response = await axios.post(baseUrl, testCase.data, {
          headers: testCase.headers
        });
        
        console.log('SUCCESS! Status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.log('FAILED! Status:', error.response?.status);
        console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
};

testLoginFormats();

import api from '../utils/apiUtils';

// Simplified auth service without JWT
const AUTH_API_URL = 'http://localhost:5000/api/auth';

// Login user
const login = async (userData) => {
  try {
    console.log('Login request data:', JSON.stringify(userData));
    
    // Use the API call for all users, including admin
    const response = await api.post(`${AUTH_API_URL}/login`, userData);
    console.log('Login response:', response.data);
    
    if (response.data && response.data.user) {
      // Ensure we store the complete user object with _id
      const user = {
        _id: response.data.user.id || response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
        assignedBlocks: response.data.user.assignedBlocks || []
      };
      
      // Store user data in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Log stored data for debugging
      console.log('Stored user data:', {
        isAuthenticated: localStorage.getItem('isAuthenticated'),
        currentUser: localStorage.getItem('currentUser')
      });
      
      return { success: true, user: user };
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.message);
    // Clear any existing auth data on error
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    throw error;
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('currentUser');
};

// Get current user from localStorage - simplified version without JWT
const getCurrentUser = async () => {
  try {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
       // If the user in localStorage is the old hardcoded admin, force refetch from backend
      if (user?._id === 'admin_id_123') {
         console.log('getCurrentUser: Hardcoded admin found in localStorage, forcing backend fetch.');
         throw new Error('Force refetch'); // Trigger catch block to fetch from backend
      }
      return user;
    }
    throw new Error('User not found in localStorage');
  } catch (error) {
    console.error('Get current user from localStorage error:', error.message);
    // If user not found in localStorage or hardcoded admin found, try fetching from backend
    try {
      console.log('Attempting to fetch user from backend...');
      const response = await api.get(`${AUTH_API_URL}/me`);
      console.log('Fetch user from backend response:', response.data);
      if (response.data && response.data.data) {
        // Update localStorage with fresh data from backend
        localStorage.setItem('currentUser', JSON.stringify(response.data.data));
        return response.data.data;
      }
      throw new Error('User not found in backend response');
    } catch (backendError) {
      console.error('Get user from backend error:', backendError.message);
      throw backendError;
    }
  }
};

// Function to fetch user data from backend
const fetchUserDataFromBackend = async () => {
  try {
    console.log('Fetching user data from backend...');
    const response = await api.get(`${AUTH_API_URL}/me`);
    console.log('Fetch user data from backend response:', response.data);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error('User data not found in backend response');
  } catch (error) {
    console.error('Error fetching user data from backend:', error.message);
    throw error;
  }
};

// Update user profile
const updateProfile = async (userData) => {
  try {
    console.log('Updating profile with data:', userData);
    
    // Ensure we're sending the user ID in the FormData for database users
    // The backend controller will handle the hardcoded admin case based on req.user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser._id && currentUser._id !== 'admin_id_123' && userData instanceof FormData) {
        userData.append('_id', currentUser._id);
    }
    
    const response = await api.put(`${AUTH_API_URL}/profile`, userData);
    console.log('Profile update response:', response.data);
    
    if (response.data && response.data.user) {
      // Update localStorage with new user data from backend
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      return response.data.user;
    }
    throw new Error('Profile update failed');
  } catch (error) {
    console.error('Update profile error:', error.message);
    throw error;
  }
};

// Update user password - simplified version
const updatePassword = async (passwordData) => {
  try {
    // Simply return success as we're not verifying passwords
    return { success: true };
  } catch (error) {
    console.error('Update password error:', error.message);
    throw error;
  }
};

const authService = {
  login,
  logout,
  getCurrentUser,
  fetchUserDataFromBackend,
  updateProfile,
  updatePassword
};

export default authService;

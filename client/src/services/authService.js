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
    
    if (response.data && response.data.user && response.data.token) {
      // Extract user data and token
      const { user, token } = response.data;
      
      // Create user object to store in localStorage and Redux state
      const userWithToken = {
        _id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedBlocks: user.assignedBlocks || []
      };
      
      // Store user data and token in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify(userWithToken));
      localStorage.setItem('token', token);
      
      // Log stored data for debugging
      console.log('Stored user data:', {
        isAuthenticated: localStorage.getItem('isAuthenticated'),
        currentUser: localStorage.getItem('currentUser'),
        token: localStorage.getItem('token')
      });
      
      return { success: true, user: userWithToken };
    }
    
    // If login was successful but no user or token in response (shouldn't happen with current backend)
    if (response.data) {
      console.error('Login response missing user or token:', response.data);
      throw new Error(response.data.message || 'Login response missing user or token');
    }

    throw new Error('Login failed: Invalid response from server');
  } catch (error) {
    console.error('Login error:', error.message);
    // Clear any existing auth data on error
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    throw error;
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('token');
};

// Get current user from localStorage - simplified version with token
const getCurrentUser = async () => {
  try {
    const userStr = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');

    if (userStr && token) {
      const user = JSON.parse(userStr);
       // If the user in localStorage is the old hardcoded admin, force refetch from backend
      if (user?._id === 'admin_id_123') {
         console.log('getCurrentUser: Hardcoded admin found in localStorage, forcing backend fetch.');
         // Clear potentially outdated hardcoded admin data before fetching
         localStorage.removeItem('isAuthenticated');
         localStorage.removeItem('currentUser');
         localStorage.removeItem('token');
         throw new Error('Force refetch'); // Trigger catch block to fetch from backend
      }
      // Return user object including the token
      return { ...user, token };
    }
    throw new Error('User or token not found in localStorage');
  } catch (error) {
    console.error('Get current user from localStorage error:', error.message);
    // If user/token not found in localStorage or hardcoded admin found, try fetching from backend
    try {
      console.log('Attempting to fetch user from backend with current token...');
       // Attempt to fetch user from backend using the api utility which should include token in headers if available
      const response = await api.get(`${AUTH_API_URL}/me`);
      console.log('Fetch user from backend response:', response.data);
      if (response.data && response.data.data) {
         const fetchedUser = response.data.data;
         // Assuming backend /me returns user data including the token or that the api utility handles token refresh/inclusion
         // If backend /me doesn't return token, you might need to handle token refresh separately or ensure login is the primary way to get a fresh token.
         
        // For now, assume the api utility ensures the token is handled for this protected route
        // Update localStorage with fresh data from backend, including the token if the API provides it or if api utility handles it
        // NOTE: If the /me endpoint doesn't return the token, this logic needs adjustment.
        // Assuming the backend /me route is protected and successful fetch implies valid auth.
        localStorage.setItem('isAuthenticated', 'true'); // User is authenticated if /me is successful
        localStorage.setItem('currentUser', JSON.stringify(fetchedUser));
        // If backend /me does not return token, you might need to rely on the token already in localStorage if api utility uses it.
        // For simplicity, let's assume api utility handles token inclusion for /me based on stored token.

        // Re-fetch token from localStorage as /me might not return it explicitly
        const tokenAfterFetch = localStorage.getItem('token');
        if (tokenAfterFetch) {
            return { ...fetchedUser, token: tokenAfterFetch };
        } else {
             // If /me was successful but no token is in localStorage (shouldn't happen if login worked), something is off.
             console.warn('Fetched user data from backend via /me, but no token found in localStorage.');
             return fetchedUser; // Return user data without token
        }
      }
      throw new Error('User data not found in backend /me response');
    } catch (backendError) {
      console.error('Get user from backend via /me error:', backendError.message);
      // Clear auth data if /me endpoint fails, as it suggests auth is invalid
       localStorage.removeItem('isAuthenticated');
       localStorage.removeItem('currentUser');
       localStorage.removeItem('token');
      throw backendError;
    }
  }
};

// Function to fetch user data from backend - potentially redundant with getCurrentUser now trying backend
// Keeping for clarity if needed elsewhere, but getCurrentUser is now preferred for initial load/check.
const fetchUserDataFromBackend = async () => {
   // This function's logic is largely merged into getCurrentUser for auth check flow.
   // Consider if a separate function is truly needed or if getCurrentUser suffices.
   console.warn('fetchUserDataFromBackend called. Consider using getCurrentUser.');
   return getCurrentUser(); // Delegate to getCurrentUser logic
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
     // The api utility should automatically add the token from localStorage
    const response = await api.put(`${AUTH_API_URL}/profile`, userData);
    console.log('Profile update response:', response.data);
    
    if (response.data && response.data.user) {
      // Update localStorage with new user data from backend
      // Assuming the response includes the latest user data, potentially including updated assignedBlocks etc.
      const updatedUser = response.data.user;
       // Keep the existing token in localStorage as profile update likely doesn't issue a new one
      const existingToken = localStorage.getItem('token');
      const userWithToken = { ...updatedUser, token: existingToken };

      localStorage.setItem('currentUser', JSON.stringify(userWithToken));

      return updatedUser; // Return updated user data without token to slice (slice will get token from state)
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
     // The api utility should automatically add the token from localStorage
    const response = await api.put(`${AUTH_API_URL}/password`, passwordData);
     console.log('Update password response:', response.data);
     return response.data; // Assuming success message or status in response
  } catch (error) {
    console.error('Update password error:', error.response?.data?.message || error.message);
    throw error.response?.data?.message || error;
  }
};

const authService = {
  login,
  logout,
  getCurrentUser,
  fetchUserDataFromBackend, // Consider if still needed or replace with getCurrentUser
  updateProfile,
  updatePassword
};

export default authService;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

// Load user from localStorage
const loadUserFromStorage = () => {
  try {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userStr = localStorage.getItem('currentUser');
  
  if (!isAuthenticated || !userStr) {
      console.log('No authenticated user found in localStorage');
    return { isAuthenticated: false, user: null };
  }
  
    const user = JSON.parse(userStr);
    console.log('Loaded user from localStorage:', user);
    
    return {
      isAuthenticated: true,
      user
    };
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    return { isAuthenticated: false, user: null };
  }
};

const initialState = loadUserFromStorage();

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      console.log('Login attempt with data:', userData);
      const response = await authService.login(userData);
      console.log('Login response:', response);
      return response.user;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      authService.logout();
      return null;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Check authentication status
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      if (!state.auth.isAuthenticated) {
        return thunkAPI.rejectWithValue('Not authenticated');
      }
      
      console.log('Checking authentication status...');
      const user = await authService.getCurrentUser();
      console.log('Current user:', user);
      return user;
    } catch (error) {
      console.error('Auth check error:', error);
      const message = error.message || 'Authentication check failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, thunkAPI) => {
    try {
      return await authService.updateProfile(userData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update password
export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (passwordData, thunkAPI) => {
    try {
      return await authService.updatePassword(passwordData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Password update failed';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunk for fetching user data from backend
export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (_, thunkAPI) => {
    try {
      const user = await authService.fetchUserDataFromBackend();
      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.loading = false;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })
      
      // Update profile cases
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update password cases
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch user data cases
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  }
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;

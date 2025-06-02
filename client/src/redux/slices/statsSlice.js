import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

// Async thunk for fetching system admin stats
export const fetchStats = createAsyncThunk(
  'stats/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await dashboardService.getSystemAdminStats();
      return stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

// Async thunk for fetching admin stats
export const fetchAdminStats = createAsyncThunk(
  'stats/fetchAdminStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await dashboardService.getAdminStats();
      return stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin stats');
    }
  }
);

// Async thunk for fetching block head stats
export const fetchBlockHeadStats = createAsyncThunk(
  'stats/fetchBlockHeadStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await dashboardService.getBlockHeadStats();
      return stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch block head stats');
    }
  }
);

const initialState = {
  stats: null,
  adminStats: null,
  blockHeadStats: null,
  loading: false,
  error: null,
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchStats
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.stats = null;
      })
      // fetchAdminStats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.adminStats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.adminStats = null;
      })
      // fetchBlockHeadStats
      .addCase(fetchBlockHeadStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlockHeadStats.fulfilled, (state, action) => {
        state.loading = false;
        state.blockHeadStats = action.payload;
      })
      .addCase(fetchBlockHeadStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.blockHeadStats = null;
      });
  },
});

export const {} = statsSlice.actions;
export default statsSlice.reducer; 
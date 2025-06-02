import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import requestService from '../../services/requestService';

// Async thunks
export const fetchRequests = createAsyncThunk(
  'requests/fetchRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await requestService.getRequests();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
    }
  }
);

export const fetchRequestsByBlock = createAsyncThunk(
  'requests/fetchRequestsByBlock',
  async (blockId, { rejectWithValue }) => {
    try {
      return await requestService.getRequestsByBlock(blockId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch requests for block');
    }
  }
);

export const fetchRequestById = createAsyncThunk(
  'requests/fetchRequestById',
  async (id, { rejectWithValue }) => {
    try {
      return await requestService.getRequestById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch request');
    }
  }
);

export const createRequest = createAsyncThunk(
  'requests/createRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await requestService.createRequest(requestData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create request');
    }
  }
);

export const updateRequest = createAsyncThunk(
  'requests/updateRequest',
  async ({ id, requestData }, { rejectWithValue }) => {
    try {
      const response = await requestService.updateRequest(id, requestData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update request');
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  'requests/updateRequestStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await requestService.updateRequestStatus(id, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update request status');
    }
  }
);

export const deleteRequest = createAsyncThunk(
  'requests/deleteRequest',
  async (id, { rejectWithValue }) => {
    try {
      await requestService.deleteRequest(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete request');
    }
  }
);

const initialState = {
  requests: [],
  blockRequests: [],
  currentRequest: null,
  loading: false,
  error: null,
  success: false
};

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    resetRequestState: (state) => {
      state.error = null;
      state.success = false;
      state.loading = false;
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch requests
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
        state.success = true;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch requests by block
      .addCase(fetchRequestsByBlock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequestsByBlock.fulfilled, (state, action) => {
        state.loading = false;
        state.blockRequests = action.payload;
      })
      .addCase(fetchRequestsByBlock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch request by ID
      .addCase(fetchRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create request
      .addCase(createRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.push(action.payload);
        state.success = true;
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update request
      .addCase(updateRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = state.requests.map(request =>
          request._id === action.payload._id ? action.payload : request
        );
        state.success = true;
      })
      .addCase(updateRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update request status
      .addCase(updateRequestStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = state.requests.map(request =>
          request._id === action.payload._id ? action.payload : request
        );
        state.success = true;
      })
      .addCase(updateRequestStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete request
      .addCase(deleteRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = state.requests.filter(request => request._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const { resetRequestState, clearCurrentRequest } = requestSlice.actions;
export default requestSlice.reducer;

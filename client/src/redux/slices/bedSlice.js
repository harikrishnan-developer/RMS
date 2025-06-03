import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import bedService from '../../services/bedService';

// Async thunks
export const fetchBeds = createAsyncThunk(
  'beds/fetchBeds',
  async (_, { rejectWithValue }) => {
    try {
      return await bedService.getBeds();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch beds');
    }
  }
);

export const fetchBedsByRoom = createAsyncThunk(
  'beds/fetchBedsByRoom',
  async (roomId, { rejectWithValue }) => {
    try {
      return await bedService.getBedsByRoom(roomId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch beds for room');
    }
  }
);

export const fetchBedById = createAsyncThunk(
  'beds/fetchBedById',
  async (id, { rejectWithValue }) => {
    try {
      return await bedService.getBedById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bed');
    }
  }
);

export const createBed = createAsyncThunk(
  'beds/createBed',
  async (bedData, { rejectWithValue }) => {
    try {
      return await bedService.createBed(bedData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create bed');
    }
  }
);

export const updateBed = createAsyncThunk(
  'beds/updateBed',
  async ({ id, bedData }, { rejectWithValue }) => {
    try {
      return await bedService.updateBed(id, bedData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update bed');
    }
  }
);

export const deleteBed = createAsyncThunk(
  'beds/deleteBed',
  async (id, { rejectWithValue }) => {
    try {
      await bedService.deleteBed(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete bed');
    }
  }
);

export const assignBed = createAsyncThunk(
  'beds/assign',
  async ({ bedId, occupantData }, { rejectWithValue }) => {
    try {
      const response = await bedService.assignBed(bedId, occupantData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign bed');
    }
  }
);

export const vacateBed = createAsyncThunk(
  'beds/vacateBed',
  async ({ bedId, earlyVacateData }, { rejectWithValue }) => {
    try {
      console.log('Sending vacate request with data:', { bedId, earlyVacateData });
      const response = await bedService.vacateBed(bedId, earlyVacateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to vacate bed');
    }
  }
);

export const fetchEarlyVacateHistory = createAsyncThunk(
  'beds/fetchEarlyVacateHistory',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching early vacate history...');
      const response = await bedService.getEarlyVacateHistory();
      console.log('Early vacate history response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching early vacate history:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch early vacate history');
    }
  }
);

const initialState = {
  beds: [],
  roomBeds: [],
  currentBed: null,
  earlyVacateHistory: [],
  loading: false,
  error: null,
  success: false
};

const bedSlice = createSlice({
  name: 'beds',
  initialState,
  reducers: {
    resetBedState: (state) => {
      state.error = null;
      state.success = false;
      state.loading = false;
    },
    clearCurrentBed: (state) => {
      state.currentBed = null;
    },
    clearBeds: (state) => {
      state.roomBeds = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchBeds
      .addCase(fetchBeds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBeds.fulfilled, (state, action) => {
        state.loading = false;
        state.beds = action.payload;
      })
      .addCase(fetchBeds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchBedsByRoom
      .addCase(fetchBedsByRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBedsByRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.roomBeds = action.payload.data || [];
      })
      .addCase(fetchBedsByRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchBedById
      .addCase(fetchBedById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBedById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBed = action.payload;
      })
      .addCase(fetchBedById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // createBed
      .addCase(createBed.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBed.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.beds.push(action.payload);
        
        // If this bed belongs to the current room, add it to roomBeds too
        if (state.roomBeds.length > 0 && state.roomBeds[0].room === action.payload.room) {
          state.roomBeds.push(action.payload);
        }
      })
      .addCase(createBed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // updateBed
      .addCase(updateBed.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBed.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // Update in the beds array
        const bedIndex = state.beds.findIndex(bed => bed._id === action.payload._id);
        if (bedIndex !== -1) {
          state.beds[bedIndex] = action.payload;
        }
        
        // Update in the roomBeds array
        const roomBedIndex = state.roomBeds.findIndex(bed => bed._id === action.payload._id);
        if (roomBedIndex !== -1) {
          state.roomBeds[roomBedIndex] = action.payload;
        }
        
        // Update currentBed if it's the same
        if (state.currentBed && state.currentBed._id === action.payload._id) {
          state.currentBed = action.payload;
        }
      })
      .addCase(updateBed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // deleteBed
      .addCase(deleteBed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBed.fulfilled, (state, action) => {
        state.loading = false;
        
        // Remove from the beds array
        state.beds = state.beds.filter(bed => bed._id !== action.payload);
        
        // Remove from the roomBeds array
        state.roomBeds = state.roomBeds.filter(bed => bed._id !== action.payload);
        
        // Clear currentBed if it's the deleted one
        if (state.currentBed && state.currentBed._id === action.payload) {
          state.currentBed = null;
        }
      })
      .addCase(deleteBed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // assignBed
      .addCase(assignBed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignBed.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          const updatedBed = action.payload.data;
          const index = state.roomBeds.findIndex(bed => bed._id === updatedBed._id);
          if (index !== -1) {
            state.roomBeds[index] = updatedBed;
          }
        }
      })
      .addCase(assignBed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to assign bed';
      })
      
      // vacateBed
      .addCase(vacateBed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(vacateBed.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          const updatedBed = action.payload.data;
          const index = state.roomBeds.findIndex(bed => bed._id === updatedBed._id);
          if (index !== -1) {
            state.roomBeds[index] = updatedBed;
          }
        }
      })
      .addCase(vacateBed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to vacate bed';
      })
      
      // fetchEarlyVacateHistory
      .addCase(fetchEarlyVacateHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEarlyVacateHistory.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Setting early vacate history:', action.payload);
        state.earlyVacateHistory = action.payload.data || [];
      })
      .addCase(fetchEarlyVacateHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Failed to fetch early vacate history:', action.payload);
      });
  }
});

export const { resetBedState, clearCurrentBed, clearBeds } = bedSlice.actions;
export default bedSlice.reducer;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import roomService from '../../services/roomService';

// Async thunks
export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async (_, { rejectWithValue }) => {
    try {
      return await roomService.getRooms();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rooms');
    }
  }
);

export const fetchRoomsByBlock = createAsyncThunk(
  'rooms/fetchRoomsByBlock',
  async (blockId, { rejectWithValue }) => {
    try {
      return await roomService.getRoomsByBlock(blockId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rooms for block');
    }
  }
);

export const fetchRoomById = createAsyncThunk(
  'rooms/fetchRoomById',
  async (id, { rejectWithValue }) => {
    try {
      return await roomService.getRoomById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch room');
    }
  }
);

export const createRoom = createAsyncThunk(
  'rooms/createRoom',
  async (roomData, { rejectWithValue }) => {
    try {
      return await roomService.createRoom(roomData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create room');
    }
  }
);

export const updateRoom = createAsyncThunk(
  'rooms/updateRoom',
  async ({ id, roomData }, { rejectWithValue }) => {
    try {
      return await roomService.updateRoom(id, roomData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update room');
    }
  }
);

export const deleteRoom = createAsyncThunk(
  'rooms/deleteRoom',
  async (id, { rejectWithValue }) => {
    try {
      await roomService.deleteRoom(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete room');
    }
  }
);

const initialState = {
  rooms: [],
  blockRooms: [],
  currentRoom: null,
  loading: false,
  error: null,
  success: false
};

const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    resetRoomState: (state) => {
      state.error = null;
      state.success = false;
      state.loading = false;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchRooms
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchRoomsByBlock
      .addCase(fetchRoomsByBlock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomsByBlock.fulfilled, (state, action) => {
        state.loading = false;
        state.blockRooms = action.payload.data || [];
      })
      .addCase(fetchRoomsByBlock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchRoomById
      .addCase(fetchRoomById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload.data;
      })
      .addCase(fetchRoomById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // createRoom
      .addCase(createRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.rooms.push(action.payload);
        
        // If this room belongs to the current block, add it to blockRooms too
        if (state.blockRooms.length > 0 && state.blockRooms[0].block === action.payload.block) {
          state.blockRooms.push(action.payload);
        }
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // updateRoom
      .addCase(updateRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // Update in the rooms array
        const roomIndex = state.rooms.findIndex(room => room._id === action.payload._id);
        if (roomIndex !== -1) {
          state.rooms[roomIndex] = action.payload;
        }
        
        // Update in the blockRooms array
        const blockRoomIndex = state.blockRooms.findIndex(room => room._id === action.payload._id);
        if (blockRoomIndex !== -1) {
          state.blockRooms[blockRoomIndex] = action.payload;
        }
        
        // Update currentRoom if it's the same
        if (state.currentRoom && state.currentRoom._id === action.payload._id) {
          state.currentRoom = action.payload;
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // deleteRoom
      .addCase(deleteRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.loading = false;
        
        // Remove from the rooms array
        state.rooms = state.rooms.filter(room => room._id !== action.payload);
        
        // Remove from the blockRooms array
        state.blockRooms = state.blockRooms.filter(room => room._id !== action.payload);
        
        // Clear currentRoom if it's the deleted one
        if (state.currentRoom && state.currentRoom._id === action.payload) {
          state.currentRoom = null;
        }
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetRoomState, clearCurrentRoom } = roomSlice.actions;
export default roomSlice.reducer;

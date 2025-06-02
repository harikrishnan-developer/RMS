import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import blockService from '../../services/blockService';

// Async thunks
export const fetchBlocks = createAsyncThunk(
  'blocks/fetchBlocks',
  async (_, { rejectWithValue }) => {
    try {
      return await blockService.getBlocks();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blocks');
    }
  }
);

export const fetchBlockById = createAsyncThunk(
  'blocks/fetchBlockById',
  async (id, { rejectWithValue }) => {
    try {
      return await blockService.getBlockById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch block');
    }
  }
);

export const createBlock = createAsyncThunk(
  'blocks/createBlock',
  async (blockData, { rejectWithValue }) => {
    try {
      return await blockService.createBlock(blockData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create block');
    }
  }
);

export const updateBlock = createAsyncThunk(
  'blocks/updateBlock',
  async ({ id, blockData }, { rejectWithValue }) => {
    try {
      return await blockService.updateBlock(id, blockData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update block');
    }
  }
);

export const deleteBlock = createAsyncThunk(
  'blocks/deleteBlock',
  async (id, { rejectWithValue }) => {
    try {
      await blockService.deleteBlock(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete block');
    }
  }
);

const initialState = {
  blocks: [],
  currentBlock: null,
  loading: false,
  error: null,
  success: false
};

const blockSlice = createSlice({
  name: 'blocks',
  initialState,
  reducers: {
    resetBlockState: (state) => {
      state.error = null;
      state.success = false;
      state.loading = false;
    },
    clearCurrentBlock: (state) => {
      state.currentBlock = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchBlocks
      .addCase(fetchBlocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlocks.fulfilled, (state, action) => {
        state.loading = false;
        state.blocks = action.payload.data || [];
      })
      .addCase(fetchBlocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchBlockById
      .addCase(fetchBlockById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlockById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlock = action.payload;
      })
      .addCase(fetchBlockById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // createBlock
      .addCase(createBlock.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBlock.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.blocks.push(action.payload);
      })
      .addCase(createBlock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // updateBlock
      .addCase(updateBlock.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBlock.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        const index = state.blocks.findIndex(block => block._id === action.payload._id);
        if (index !== -1) {
          state.blocks[index] = action.payload;
        }
        
        if (state.currentBlock && state.currentBlock._id === action.payload._id) {
          state.currentBlock = action.payload;
        }
      })
      .addCase(updateBlock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // deleteBlock
      .addCase(deleteBlock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlock.fulfilled, (state, action) => {
        state.loading = false;
        state.blocks = state.blocks.filter(block => block._id !== action.payload);
        if (state.currentBlock && state.currentBlock._id === action.payload) {
          state.currentBlock = null;
        }
      })
      .addCase(deleteBlock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetBlockState, clearCurrentBlock } = blockSlice.actions;
export default blockSlice.reducer;

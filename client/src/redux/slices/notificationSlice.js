import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';
import { toast } from 'react-toastify';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  }
};

// Get all notifications
export const getNotifications = createAsyncThunk(
  'notifications/getAll',
  async (page = 1, thunkAPI) => {
    try {
      return await notificationService.getNotifications(page);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch notifications';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get unread notification count
export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (_, thunkAPI) => {
    try {
      return await notificationService.getUnreadCount();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch unread count';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, thunkAPI) => {
    try {
      return await notificationService.markAsRead(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to mark notification as read';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, thunkAPI) => {
    try {
      return await notificationService.markAllAsRead();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to mark all notifications as read';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, thunkAPI) => {
    try {
      return await notificationService.deleteNotification(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete notification';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotificationState: (state) => {
      state.error = null;
      state.loading = false;
    },
    // Add a new notification (used when receiving from WebSocket)
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
      // Show toast notification
      toast.info(action.payload.message);
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all notifications
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
        state.pagination = {
          currentPage: action.payload.pagination?.page || 1,
          totalPages: Math.ceil(action.payload.total / action.payload.pagination?.limit) || 1,
          hasNextPage: !!action.payload.pagination?.next,
          hasPrevPage: !!action.payload.pagination?.prev
        };
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.data.count;
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload.data._id);
        if (index !== -1) {
          state.notifications[index] = action.payload.data;
          if (state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
        }
      })
      
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          isRead: true
        }));
        state.unreadCount = 0;
      })
      
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.meta.arg);
        if (index !== -1) {
          // Check if notification was unread before removing
          if (!state.notifications[index].isRead && state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
          state.notifications.splice(index, 1);
        }
      });
  }
});

export const { resetNotificationState, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

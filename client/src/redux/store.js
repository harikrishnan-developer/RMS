import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bedReducer from './slices/bedSlice';
import blockReducer from './slices/blockSlice';
import notificationReducer from './slices/notificationSlice';
import requestReducer from './slices/requestSlice';
import roomReducer from './slices/roomSlice';
import statsReducer from './slices/statsSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    blocks: blockReducer,
    rooms: roomReducer,
    beds: bedReducer,
    requests: requestReducer,
    stats: statsReducer,
    notifications: notificationReducer,
    ui: uiReducer
  }
});

export default store;

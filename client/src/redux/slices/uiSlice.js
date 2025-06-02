import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  loading: false,
  currentModal: null,
  modalData: null
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    openModal: (state, action) => {
      state.currentModal = action.payload.modalType;
      state.modalData = action.payload.modalData || null;
    },
    closeModal: (state) => {
      state.currentModal = null;
      state.modalData = null;
    }
  }
});

export const { 
  toggleSidebar, 
  setSidebarOpen, 
  setLoading, 
  openModal, 
  closeModal 
} = uiSlice.actions;

export default uiSlice.reducer;

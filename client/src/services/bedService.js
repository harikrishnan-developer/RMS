import api from '../utils/apiUtils';

// API endpoint
const API_ENDPOINT = '/beds';

// Get all beds
const getBeds = async () => {
  const response = await api.get(API_ENDPOINT);
  return response.data;
};

// Get beds by room
const getBedsByRoom = async (roomId) => {
  const response = await api.get(`/rooms/${roomId}/beds`);
  return response.data;
};

// Get bed by ID
const getBedById = async (bedId) => {
  const response = await api.get(`${API_ENDPOINT}/${bedId}`);
  return response.data;
};

// Create new bed
const createBed = async (bedData) => {
  const { room } = bedData;
  const response = await api.post(`/rooms/${room}/beds`, bedData);
  return response.data;
};

// Update bed
const updateBed = async (bedId, bedData) => {
  const response = await api.put(`${API_ENDPOINT}/${bedId}`, bedData);
  return response.data;
};

// Delete bed
const deleteBed = async (bedId) => {
  const response = await api.delete(`${API_ENDPOINT}/${bedId}`);
  return response.data;
};

const bedService = {
  getBeds,
  getBedsByRoom,
  getBedById,
  createBed,
  updateBed,
  deleteBed
};

export default bedService;

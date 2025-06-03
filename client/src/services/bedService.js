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
  const response = await api.get(`${API_ENDPOINT}/room/${roomId}`);
  return response.data;
};

// Get bed by ID
const getBedById = async (bedId) => {
  const response = await api.get(`${API_ENDPOINT}/${bedId}`);
  return response.data;
};

// Create new bed
const createBed = async (bedData) => {
  const response = await api.post(API_ENDPOINT, bedData);
  return response.data;
};

// Update bed
const updateBed = async (id, bedData) => {
  const response = await api.put(`${API_ENDPOINT}/${id}`, bedData);
  return response.data;
};

// Delete bed
const deleteBed = async (id) => {
  const response = await api.delete(`${API_ENDPOINT}/${id}`);
  return response.data;
};

// Assign bed to occupant
const assignBed = async (bedId, occupantData) => {
  const response = await api.put(`${API_ENDPOINT}/${bedId}/assign`, occupantData);
  return response.data;
};

// Vacate bed
const vacateBed = async (bedId, earlyVacateData) => {
  console.log('Service: Vacating bed with data:', { bedId, earlyVacateData });
  const response = await api.put(`${API_ENDPOINT}/${bedId}/vacate`, earlyVacateData);
  return response.data;
};

// Get early vacate history
const getEarlyVacateHistory = async () => {
  const response = await api.get(`${API_ENDPOINT}/early-vacate-history`);
  return response.data;
};

const bedService = {
  getBeds,
  getBedsByRoom,
  getBedById,
  createBed,
  updateBed,
  deleteBed,
  assignBed,
  vacateBed,
  getEarlyVacateHistory
};

export default bedService;

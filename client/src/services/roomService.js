import api from '../utils/apiUtils';

// API endpoint
const API_ENDPOINT = '/rooms';

// Get all rooms
const getRooms = async () => {
  const response = await api.get(API_ENDPOINT);
  return response.data.data;
};

// Get rooms by block ID
const getRoomsByBlock = async (blockId) => {
  const response = await api.get(`${API_ENDPOINT}/block/${blockId}`);
  return response.data;
};

// Get room by ID
const getRoomById = async (roomId) => {
  const response = await api.get(`${API_ENDPOINT}/${roomId}`);
  return response.data;
};

// Create new room
const createRoom = async (roomData) => {
  const response = await api.post(API_ENDPOINT, roomData);
  return response.data;
};

// Update room
const updateRoom = async (roomId, roomData) => {
  const response = await api.put(`${API_ENDPOINT}/${roomId}`, roomData);
  return response.data;
};

// Delete room
const deleteRoom = async (roomId) => {
  await api.delete(`${API_ENDPOINT}/${roomId}`);
};

const roomService = {
  getRooms,
  getRoomsByBlock,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};

export default roomService;

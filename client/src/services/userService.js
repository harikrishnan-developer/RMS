import api from '../utils/apiUtils';

// API endpoint
const API_ENDPOINT = '/users';

// Get all users
const getUsers = async () => {
  const response = await api.get(API_ENDPOINT);
  console.log('Get Users API Response:', response.data);
  // Check if response.data has a 'data' property which is an array
  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  // If response.data itself is an array, return it
  if (Array.isArray(response.data)) {
    return response.data;
  }
  // Otherwise, return an empty array
  return [];
};

// Get user by ID
const getUserById = async (userId) => {
  const response = await api.get(`${API_ENDPOINT}/${userId}`);
  return response.data;
};

// Create new user
const createUser = async (userData) => {
  const response = await api.post(API_ENDPOINT, userData);
  return response.data;
};

// Update user
const updateUser = async (userId, userData) => {
  const response = await api.put(`${API_ENDPOINT}/${userId}`, userData);
  return response.data;
};

// Delete user
const deleteUser = async (userId) => {
  await api.delete(`${API_ENDPOINT}/${userId}`);
};

// Get all block heads (users with role 'blockHead')
const getBlockHeads = async () => {
  const response = await api.get(`${API_ENDPOINT}/blockheads`);
  console.log('Block Heads Raw Response:', response.data);
  return response.data;
};

const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getBlockHeads
};

export default userService;

import api from '../utils/apiUtils';

// API endpoint
const API_ENDPOINT = '/blocks';

// Get all blocks
const getBlocks = async () => {
  const response = await api.get(API_ENDPOINT);
  return response.data;
};

// Get block by ID
const getBlockById = async (blockId) => {
  const response = await api.get(`${API_ENDPOINT}/${blockId}`);
  return response.data;
};

// Create new block
const createBlock = async (blockData) => {
  const response = await api.post(API_ENDPOINT, blockData);
  return response.data;
};

// Update block
const updateBlock = async (blockId, blockData) => {
  const response = await api.put(`${API_ENDPOINT}/${blockId}`, blockData);
  return response.data;
};

// Delete block
const deleteBlock = async (blockId) => {
  await api.delete(`${API_ENDPOINT}/${blockId}`);
};

const blockService = {
  getBlocks,
  getBlockById,
  createBlock,
  updateBlock,
  deleteBlock
};

export default blockService;

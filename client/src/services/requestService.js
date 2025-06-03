import api from '../utils/apiUtils';

// API endpoint
const API_ENDPOINT = '/requests';

// Get all requests
const getRequests = async () => {
  try {
    console.log('Fetching requests...');
  const response = await api.get(API_ENDPOINT);
    console.log('Requests response:', response.data);
  return response.data.data;
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};

// Get requests by block ID
const getRequestsByBlock = async (blockId) => {
  const response = await api.get(`${API_ENDPOINT}/block/${blockId}`);
  return response.data.data;
};

// Get request by ID
const getRequestById = async (id) => {
  try {
    console.log('Fetching request by ID:', id);
    const response = await api.get(`${API_ENDPOINT}/${id}`);
    console.log('Request response:', response.data);
  return response.data.data;
  } catch (error) {
    console.error('Error fetching request:', error);
    throw error;
  }
};

// Create new request
const createRequest = async (requestData) => {
  try {
    console.log('Creating request:', requestData);
  const response = await api.post(API_ENDPOINT, requestData);
    console.log('Create request response:', response.data);
  return response.data.data;
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

// Update request
const updateRequest = async (id, requestData) => {
  try {
    console.log('Updating request:', id, requestData);
    const response = await api.put(`${API_ENDPOINT}/${id}`, requestData);
    console.log('Update request response:', response.data);
  return response.data.data;
  } catch (error) {
    console.error('Error updating request:', error);
    throw error;
  }
};

// Update request status
const updateRequestStatus = async (id, status) => {
  try {
    console.log('Updating request status:', id, status);
    const response = await api.patch(`${API_ENDPOINT}/${id}/status`, { status });
    console.log('Update status response:', response.data);
  return response.data.data;
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};

// Delete request
const deleteRequest = async (id) => {
  try {
    console.log('Deleting request:', id);
    const response = await api.delete(`${API_ENDPOINT}/${id}`);
    console.log('Delete request response:', response.data);
  return response.data.data;
  } catch (error) {
    console.error('Error deleting request:', error);
    throw error;
  }
};

const requestService = {
  getRequests,
  getRequestsByBlock,
  getRequestById,
  createRequest,
  updateRequest,
  updateRequestStatus,
  deleteRequest
};

export default requestService;

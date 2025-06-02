import api from '../utils/apiUtils';

const API_ENDPOINT = '/dashboard';

// Get system admin dashboard stats
const getSystemAdminStats = async () => {
  const response = await api.get(`${API_ENDPOINT}/system-admin`);
  return response.data;
};

// Get admin dashboard stats
const getAdminStats = async () => {
  const response = await api.get(`${API_ENDPOINT}/admin`);
  return response.data;
};

// Get block head dashboard stats
const getBlockHeadStats = async () => {
  const response = await api.get(`${API_ENDPOINT}/block-head`);
  return response.data;
};

const dashboardService = {
  getSystemAdminStats,
  getAdminStats,
  getBlockHeadStats,
};

export default dashboardService; 
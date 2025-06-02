import api from '../utils/apiUtils';

const API_ENDPOINT = '/notifications';

// Get all notifications with pagination
const getNotifications = async (page = 1, limit = 20) => {
  const response = await api.get(`${API_ENDPOINT}?page=${page}&limit=${limit}`);
  return response.data;
};

// Get unread notification count
const getUnreadCount = async () => {
  const response = await api.get(`${API_ENDPOINT}/unread/count`);
  return response.data;
};

// Mark notification as read
const markAsRead = async (id) => {
  const response = await api.put(`${API_ENDPOINT}/${id}/read`, {});
  return response.data;
};

// Mark all notifications as read
const markAllAsRead = async () => {
  const response = await api.put(`${API_ENDPOINT}/read-all`, {});
  return response.data;
};

// Delete notification
const deleteNotification = async (id) => {
  const response = await api.delete(`${API_ENDPOINT}/${id}`);
  return response.data;
};

const notificationService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

export default notificationService;

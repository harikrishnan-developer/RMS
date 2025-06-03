import axios from 'axios';
import { handleApiError } from './errorHandler';

// Base API URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL
});

// Request interceptor for adding auth token and user data
api.interceptors.request.use(
  (config) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    console.log('Is authenticated:', isAuthenticated);
    
    if (isAuthenticated) {
      const userData = localStorage.getItem('currentUser');
      const token = localStorage.getItem('token');
      console.log('User data from localStorage:', userData);
      console.log('Token from localStorage:', token);
      
      if (userData && token) {
        try {
          // Ensure userData is properly stringified
          const parsedUser = JSON.parse(userData);
          config.headers['x-user-data'] = JSON.stringify(parsedUser);
          // Add the JWT token to the Authorization header
          config.headers['Authorization'] = `Bearer ${token}`;
          console.log('Request headers:', config.headers);
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear invalid data
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } else {
        // No user data or token found, redirect to login
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('No user data or token found'));
      }
    }

    // Don't set Content-Type for FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Use the common error handler utility
    handleApiError(error);
    return Promise.reject(error);
  }
);

export default api;

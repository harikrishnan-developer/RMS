import api from '../utils/apiUtils';

const API_URL = '/courses';

// Create new course
const createCourse = async (courseData) => {
  const response = await api.post(API_URL, courseData);
  return response.data;
};

// Get all courses
const getCourses = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

const courseService = {
  createCourse,
  getCourses,
};

export default courseService; 
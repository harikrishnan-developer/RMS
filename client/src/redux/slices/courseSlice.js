import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import courseService from '../../services/courseService';

// Async thunk for creating a course
export const createCourse = createAsyncThunk(
  'courses/create',
  async (courseData, { rejectWithValue }) => {
    try {
      const response = await courseService.createCourse(courseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create course');
    }
  }
);

// Async thunk for getting all courses
export const getCourses = createAsyncThunk(
  'courses/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseService.getCourses();
      console.log('Courses fetched successfully:', response.data); // Log success
      return response.data;
    } catch (error) {
      console.error('Error in getCourses thunk:', error.response?.data?.message || error.message); // Log error
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

const initialState = {
  courses: [],
  loading: false,
  error: null,
  success: false,
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    resetCourseState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.courses.push(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get Courses
      .addCase(getCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.courses = action.payload; // Assuming payload.data is the array of courses
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetCourseState } = courseSlice.actions;
export default courseSlice.reducer; 
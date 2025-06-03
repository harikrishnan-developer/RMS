const Course = require('../models/Course');

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (System Admin only)
exports.createCourse = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    // Handle duplicate key error (unique course name)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Course name already exists'
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private (System Admin only)
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate({
      path: 'createdBy',
      select: 'name' // Populate createdBy with user's name
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
}; 
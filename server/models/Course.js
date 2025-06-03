const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, 'Please add a course name'],
    trim: true,
    unique: true
  },
  duration: {
    type: String,
    required: [true, 'Please add course duration']
  },
  date: {
    type: Date,
    required: [true, 'Please add course date']
  },
  coordinatorName: {
    type: String,
    required: [true, 'Please add coordinator name'],
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', CourseSchema); 
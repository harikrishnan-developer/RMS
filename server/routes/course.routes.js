const express = require('express');
const {
  createCourse,
  getCourses
} = require('../controllers/course.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes and authorize system admins
router.use(protect);
router.use(authorize('systemAdmin'));

router
  .route('/')
  .post(createCourse)
  .get(getCourses);

module.exports = router; 
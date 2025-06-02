const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  updateProfile
} = require('../controllers/auth.controller');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');

const router = express.Router();

// Routes that don't require authentication
router.post('/login', login);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);

console.log('Auth Routes: Defining /profile PUT route');
router.put(
  '/profile',
  upload.single('profilePicture'),
  (req, res, next) => {
    console.log('Auth Routes: /profile PUT route hit after protect middleware');
    console.log('Auth Routes: req.user:', req.user);
    next();
  },
  updateProfile
);

// System Admin only routes
router.use(authorize('systemAdmin'));
router.post('/register', register);

module.exports = router;

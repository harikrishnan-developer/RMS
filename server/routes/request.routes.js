const express = require('express');
const {
  getRequests,
  getRequest,
  createRequest,
  updateRequest,
  addNote,
  assignBeds,
  rejectRequest,
  cancelRequest,
  deleteRequest,
  updateRequestStatus
} = require('../controllers/request.controller');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');

const router = express.Router();

// Public routes (if any)
// router.post('/public', publicController);

// All following routes are protected
// Removed router.use(protect);

// Routes accessible by Admin, System Admin, Block Head
router.get(
  '/',
  protect,
  (req, res, next) => {
    console.log('Request Routes: GET / route hit after protect middleware');
    console.log('Request Routes: req.user:', req.user);
    next();
  },
  authorize('admin', 'systemAdmin', 'blockHead'),
  getRequests
);

// Routes accessible by all authenticated users (after protect)
router.get('/:id', protect, getRequest);
router.post('/:id/notes', protect, authorize('admin', 'systemAdmin', 'blockHead'), addNote); // Assuming block heads can add notes too

// Routes accessible by Admin only for creating requests
router.post('/', protect, authorize('admin', 'systemAdmin'), createRequest);

// Routes accessible by Block Head only for handling requests
router.put('/:id', protect, authorize('blockHead', 'systemAdmin'), updateRequest);
router.post('/:id/cancel', protect, authorize('blockHead', 'systemAdmin'), cancelRequest);
router.post('/:id/reject', protect, authorize('blockHead', 'systemAdmin'), rejectRequest);
router.patch('/:id/status', protect, authorize('blockHead', 'systemAdmin'), updateRequestStatus);

module.exports = router;

const express = require('express');
const {
  getBeds,
  getBed,
  createBed,
  updateBed,
  deleteBed,
  getRoomBeds,
  assignBed,
  vacateBed,
  getEarlyVacateHistory
} = require('../controllers/bed.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(protect);

// Get all beds (admin only)
router.get('/', authorize('admin', 'systemAdmin'), getBeds);

// Get early vacate history (block head and admin)
router.get('/early-vacate-history', authorize('blockHead', 'admin'), getEarlyVacateHistory);

// Get beds by room
router.get('/room/:roomId', getRoomBeds);

// Get single bed
router.get('/:id', getBed);

// System admin can create and delete beds
router.post('/', authorize('systemAdmin'), createBed);
router.delete('/:id', authorize('systemAdmin'), deleteBed);

// Block head and system admin can update beds and assign/vacate
router.put('/:id', updateBed);
router.put('/:id/assign', authorize('blockHead'), assignBed);
router.put('/:id/vacate', authorize('blockHead'), vacateBed);

module.exports = router;

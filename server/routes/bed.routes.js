const express = require('express');
const {
  getBeds,
  getBed,
  createBed,
  updateBed,
  deleteBed,
  getRoomBeds,
  assignBed,
  vacateBed
} = require('../controllers/bed.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(protect);

// Routes accessible by all authenticated users
router.get('/', getBeds);
router.get('/:id', getBed);

// Get all beds in a room
router.get('/room/:roomId', getRoomBeds);

// Routes accessible by System Admin
router.use(authorize('systemAdmin', 'blockHead'));

// Block head and system admin can update beds and assign/vacate
router.put('/:id', updateBed);
router.put('/:id/assign', assignBed);
router.put('/:id/vacate', vacateBed);

// Only System Admin can create/delete beds
router.use(authorize('systemAdmin'));
router.post('/', createBed);
router.delete('/:id', deleteBed);

module.exports = router;

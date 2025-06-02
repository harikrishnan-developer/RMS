const express = require('express');
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getBlockRooms
} = require('../controllers/room.controller');

const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
const bedRouter = require('./bed.routes');

const router = express.Router({ mergeParams: true });

// Re-route into other resource routers
router.use('/:roomId/beds', bedRouter);

// All routes require authentication
router.use(protect);

// Routes accessible by all authenticated users
router.get('/', getRooms);
router.get('/:id', getRoom);

// Routes for accessing rooms within a block
router.get('/block/:blockId', getBlockRooms);

// Routes accessible by admin and system admin
router.put('/:id', authorize('admin', 'systemAdmin'), updateRoom);

// Routes accessible only by System Admin
router.use(authorize('systemAdmin'));
router.post('/', createRoom);
router.delete('/:id', deleteRoom);

module.exports = router;

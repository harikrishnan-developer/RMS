const express = require('express');
const {
  getBlocks,
  getBlock,
  createBlock,
  updateBlock,
  deleteBlock,
  getBlockStats
} = require('../controllers/block.controller');

const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
const roomRouter = require('./room.routes');

const router = express.Router();

// Re-route into other resource routers
router.use('/:blockId/rooms', roomRouter);

// Public routes
router.get('/', protect, getBlocks);
router.get('/:id', protect, getBlock);
router.get('/:id/stats', protect, getBlockStats);

// Routes accessible by System Admin only
router.post('/', protect, authorize('systemAdmin'), createBlock);
router.delete('/:id', protect, authorize('systemAdmin'), deleteBlock);

// Routes accessible by both System Admin and Admin
router.put('/:id', protect, authorize('systemAdmin', 'admin'), updateBlock);

module.exports = router;

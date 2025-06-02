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

// All routes require authentication
router.use(protect);

// Routes accessible by all authenticated users
router.get('/', getBlocks);
router.get('/:id', getBlock);
router.get('/:id/stats', getBlockStats);

// Routes accessible by admin and system admin
router.put('/:id', authorize('admin', 'systemAdmin'), updateBlock);

// Routes accessible only by System Admin
router.use(authorize('systemAdmin'));
router.post('/', createBlock);
router.delete('/:id', deleteBlock);

module.exports = router;

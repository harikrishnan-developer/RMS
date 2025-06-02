const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  assignBlocks,
  getBlockHeads
} = require('../controllers/user.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Assume multer is configured and imported elsewhere, e.g., const upload = require('../utils/upload');
// For now, we'll assume 'upload' middleware is available
const upload = require('../utils/upload'); // This line might need adjustment based on actual file location

// All routes require authentication
router.use(protect);

// Routes accessible by all authenticated users
router.get('/', getUsers);

// Routes accessible by admin and system admin
router.get('/blockheads', authorize('admin', 'systemAdmin'), getBlockHeads);

// Routes accessible only by System Admin
router.use(authorize('systemAdmin'));

router.route('/')
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(upload.single('profilePicture'), updateUser)
  .delete(deleteUser);

router.put('/:id/assign-blocks', assignBlocks);

module.exports = router;

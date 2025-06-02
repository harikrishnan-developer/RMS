const User = require('../models/User');
const Block = require('../models/Block');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (System Admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('assignedBlocks');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (System Admin only)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('assignedBlocks');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid user ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (System Admin only)
exports.createUser = async (req, res) => {
  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
    
    const user = await User.create(req.body);
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (System Admin only)
exports.updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
    }

    // Check if trying to update email to one that already exists
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }
    
    // Don't allow password updates through this route
    if (req.body.password) {
      delete req.body.password;
    }
    
    // Handle profile picture upload
    if (req.file) {
      // Assume multer is configured to save to req.file
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    // Update other fields
    user.name = req.body.name || user.name; // Update name if provided
    user.email = req.body.email || user.email; // Update email if provided

    await user.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid user ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (System Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
    }
    
    // Check if user is a block head, and if so, remove the assignment
    const blocks = await Block.find({ blockHead: req.params.id });
    if (blocks.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user as they are assigned as block head to ${blocks.length} blocks. Please reassign blocks first.`
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid user ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Assign blocks to block head
// @route   PUT /api/users/:id/assign-blocks
// @access  Private (System Admin only)
exports.assignBlocks = async (req, res) => {
  try {
    const { blocks } = req.body;
    
    if (!blocks || !Array.isArray(blocks)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of block IDs'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
    }
    
    // Check if user is a block head
    if (user.role !== 'blockHead') {
      return res.status(400).json({
        success: false,
        message: 'Can only assign blocks to users with blockHead role'
      });
    }
    
    // Update user's assigned blocks
    user.assignedBlocks = blocks;
    await user.save();
    
    // Update blocks with this block head
    for (const blockId of blocks) {
      await Block.findByIdAndUpdate(blockId, { blockHead: user._id });
    }
    
    // Get updated user with populated blocks
    const updatedUser = await User.findById(req.params.id).populate('assignedBlocks');
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all block heads
// @route   GET /api/users/blockheads
// @access  Private (System Admin only)
exports.getBlockHeads = async (req, res) => {
  try {
    const blockHeads = await User.find({ role: 'blockHead' })
      .select('-password')
      .lean();
    
    console.log('Found block heads:', blockHeads);
    
    // Always return an array, even if empty
    res.status(200).json({
      success: true,
      count: blockHeads.length,
      data: blockHeads || []
    });
  } catch (error) {
    console.error('Error in getBlockHeads:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

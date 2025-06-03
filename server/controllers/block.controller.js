const Block = require('../models/Block');
const Room = require('../models/Room');
const User = require('../models/User');

// @desc    Get all blocks
// @route   GET /api/blocks
// @access  Private
exports.getBlocks = async (req, res) => {
  try {
    const blocks = await Block.find()
      .populate('blockHead', 'name email')
      .populate('createdBy', 'name');
    
    res.status(200).json({
      success: true,
      count: blocks.length,
      data: blocks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single block
// @route   GET /api/blocks/:id
// @access  Private
exports.getBlock = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id)
      .populate('blockHead', 'name email')
      .populate('createdBy', 'name');
    
    if (!block) {
      return res.status(404).json({
        success: false,
        message: `Block not found with id of ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: block
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid block ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new block
// @route   POST /api/blocks
// @access  Private (System Admin only)
exports.createBlock = async (req, res) => {
  try {
    // Check if block name already exists
    const existingBlock = await Block.findOne({ name: req.body.name });
    if (existingBlock) {
      return res.status(400).json({
        success: false,
        message: 'Block with this name already exists'
      });
    }
    
    // Add current user as creator
    req.body.createdBy = req.user.id;
    
    const block = await Block.create(req.body);
    
    res.status(201).json({
      success: true,
      data: block
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update block
// @route   PUT /api/blocks/:id
// @access  Private (System Admin and Admin)
exports.updateBlock = async (req, res) => {
  try {
    // Check if updating to a name that already exists
    if (req.body.name) {
      const existingBlock = await Block.findOne({ 
        name: req.body.name,
        _id: { $ne: req.params.id }
      });
      
      if (existingBlock) {
        return res.status(400).json({
          success: false,
          message: 'Block with this name already exists'
        });
      }
    }
    
    // Get current block to check for block head change
    const currentBlock = await Block.findById(req.params.id);
    if (!currentBlock) {
      return res.status(404).json({
        success: false,
        message: `Block not found with id of ${req.params.id}`
      });
    }

    // Handle block head assignment/removal
    if (req.body.blockHead !== undefined) {
      // If removing block head
      if (!req.body.blockHead) {
        if (currentBlock.blockHead) {
          // Remove this block from previous block head's assigned blocks
          await User.findByIdAndUpdate(
            currentBlock.blockHead,
            { $pull: { assignedBlocks: req.params.id } }
          );
        }
      } else {
        // If assigning new block head
        const blockHead = await User.findById(req.body.blockHead);
        if (!blockHead) {
          return res.status(404).json({
            success: false,
            message: 'Block head user not found'
          });
        }
        
        if (blockHead.role !== 'blockHead') {
          return res.status(400).json({
            success: false,
            message: 'Assigned user must have blockHead role'
          });
        }

        // If there was a previous block head, remove this block from their assigned blocks
        if (currentBlock.blockHead) {
          await User.findByIdAndUpdate(
            currentBlock.blockHead,
            { $pull: { assignedBlocks: req.params.id } }
          );
        }
        
        // Add this block to new block head's assigned blocks
        await User.findByIdAndUpdate(
          req.body.blockHead,
          { $addToSet: { assignedBlocks: req.params.id } }
        );
      }
    }
    
    // Update timestamp
    req.body.updatedAt = Date.now();
    
    const block = await Block.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('blockHead', 'name email');
    
    res.status(200).json({
      success: true,
      data: block
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid block ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete block
// @route   DELETE /api/blocks/:id
// @access  Private (System Admin only)
exports.deleteBlock = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id);
    
    if (!block) {
      return res.status(404).json({
        success: false,
        message: `Block not found with id of ${req.params.id}`
      });
    }
    
    // Check if block has rooms
    const roomCount = await Room.countDocuments({ block: req.params.id });
    if (roomCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete block as it has ${roomCount} rooms. Please delete rooms first.`
      });
    }
    
    // Remove this block from block head's assigned blocks
    if (block.blockHead) {
      await User.findByIdAndUpdate(
        block.blockHead,
        { $pull: { assignedBlocks: req.params.id } }
      );
    }
    
    await block.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid block ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get block statistics
// @route   GET /api/blocks/:id/stats
// @access  Private
exports.getBlockStats = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id);
    
    if (!block) {
      return res.status(404).json({
        success: false,
        message: `Block not found with id of ${req.params.id}`
      });
    }
    
    // Get rooms in this block
    const rooms = await Room.find({ block: req.params.id });
    
    // Calculate statistics
    const stats = {
      totalRooms: rooms.length,
      roomsByType: {},
      occupancyRate: 0,
      availableRooms: 0,
      partiallyOccupiedRooms: 0,
      fullyOccupiedRooms: 0,
      maintenanceRooms: 0
    };
    
    // Count rooms by status and type
    rooms.forEach(room => {
      // Count by type
      stats.roomsByType[room.type] = (stats.roomsByType[room.type] || 0) + 1;
      
      // Count by status
      if (room.status === 'Available') {
        stats.availableRooms++;
      } else if (room.status === 'Partially Occupied') {
        stats.partiallyOccupiedRooms++;
      } else if (room.status === 'Fully Occupied') {
        stats.fullyOccupiedRooms++;
      } else if (room.status === 'Under Maintenance') {
        stats.maintenanceRooms++;
      }
    });
    
    // Calculate occupancy rate
    if (rooms.length > 0) {
      const occupiedWeight = stats.fullyOccupiedRooms + (stats.partiallyOccupiedRooms * 0.5);
      stats.occupancyRate = (occupiedWeight / (rooms.length - stats.maintenanceRooms)) * 100;
    }
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid block ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

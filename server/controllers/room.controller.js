const Room = require('../models/Room');
const Block = require('../models/Block');
const Bed = require('../models/Bed');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
exports.getRooms = async (req, res) => {
  try {
    let query = Room.find().populate({
      path: 'block',
      select: 'name'
    });

    // Filter by block if blockId is provided in query params
    if (req.query.block) {
      query = query.where('block').equals(req.query.block);
    }

    const rooms = await query;

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get rooms for a specific block
// @route   GET /api/blocks/:blockId/rooms
// @access  Private
exports.getBlockRooms = async (req, res) => {
  try {
    const block = await Block.findById(req.params.blockId);
    
    if (!block) {
      return res.status(404).json({
        success: false,
        message: `Block not found with id of ${req.params.blockId}`
      });
    }
    
    // Fetch rooms for the block
    const rooms = await Room.find({ block: req.params.blockId })
      .populate({
        path: 'block',
        select: 'name type blockHead',
        populate: {
          path: 'blockHead',
          select: 'name email'
        }
      })
      .populate({
        path: 'createdBy',
        select: 'name'
      });

    // Fetch beds for all rooms in this block and group them by room
    const allBedsInBlock = await Bed.find({ room: { $in: rooms.map(room => room._id) } }).populate('occupant', 'name contactInfo checkInDate checkOutDate purpose');

    const bedsByRoomId = allBedsInBlock.reduce((acc, bed) => {
      if (!acc[bed.room]) {
        acc[bed.room] = [];
      }
      acc[bed.room].push(bed);
      return acc;
    }, {});

    const roomsWithBedDetails = rooms.map(room => {
      const roomObj = room.toObject();
      const bedsForRoom = bedsByRoomId[room._id] || [];

      // Add totalBeds and availableBeds counts and the beds array
      const totalBeds = bedsForRoom.length;
      const availableBeds = bedsForRoom.filter(bed => bed.status === 'Available').length;

      return {
        ...roomObj,
        totalBeds,
        availableBeds,
        beds: bedsForRoom // Include the beds array here
      };
    });
    
    res.status(200).json({
      success: true,
      count: roomsWithBedDetails.length,
      data: roomsWithBedDetails
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid block ID format`
      });
    }
    
    console.error('Error in getBlockRooms:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Private
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate({
        path: 'block',
        select: 'name type blockHead',
        populate: {
          path: 'blockHead',
          select: 'name email'
        }
      })
      .populate({
        path: 'createdBy',
        select: 'name'
      });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room not found with id of ${req.params.id}`
      });
    }
    
    // Get beds for this room
    const beds = await Bed.find({ room: req.params.id }).populate('occupant', 'name contactInfo checkInDate checkOutDate purpose');
    
    // Ensure block data is properly structured
    const roomData = {
      ...room._doc,
      block: room.block ? {
        _id: room.block._id,
        name: room.block.name,
        type: room.block.type,
        blockHead: room.block.blockHead
      } : null,
      beds
    };
    
    res.status(200).json({
      success: true,
      data: roomData
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid room ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new room
// @route   POST /api/blocks/:blockId/rooms
// @access  Private (System Admin only)
exports.createRoom = async (req, res) => {
  try {
    // Get block ID from request body instead of URL params
    const blockId = req.body.block;

    // Check if block exists
    const block = await Block.findById(blockId);
    if (!block) {
      return res.status(404).json({
        success: false,
        message: `Block not found with id of ${blockId}`
      });
    }

    // Add block ID to the request body before creating the room
    req.body.block = blockId;

    // Add current user as creator
    req.body.createdBy = req.user.id;

    const room = await Room.create(req.body);

    // Update block's room counts
    block.totalRooms += 1;
    if (room.status === 'Available') {
      block.availableRooms += 1;
    }
    await block.save();

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (System Admin only)
exports.updateRoom = async (req, res) => {
  try {
    // Check if room number already exists in this block if trying to update number
    if (req.body.number) {
      const room = await Room.findById(req.params.id);
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: `Room not found with id of ${req.params.id}`
        });
      }
      
      const existingRoom = await Room.findOne({
        block: room.block,
        number: req.body.number,
        _id: { $ne: req.params.id }
      });
      
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: `Room with number ${req.body.number} already exists in this block`
        });
      }
    }
    
    // Don't allow changing the block
    if (req.body.block) {
      delete req.body.block;
    }
    
    // Update timestamp
    req.body.updatedAt = Date.now();
    
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room not found with id of ${req.params.id}`
      });
    }
    
    // Update block's room counts if status changed (simplified - assuming status change only)
    // A more robust approach would compare old and new status
    const block = await Block.findById(room.block);
    if (block) {
       // Recalculate counts based on current rooms if needed, or adjust based on status change
       // For simplicity here, we'll just save the block.
       await block.save(); // Save to potentially trigger block stats update if implemented
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid room ID format`
      });
    }
    
    console.error('Error updating room:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (System Admin only)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room not found with id of ${req.params.id}`
      });
    }
    
    // Check if room has beds
    const bedCount = await Bed.countDocuments({ room: req.params.id });
    
    if (bedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room as it has ${bedCount} beds. Please delete beds first.`
      });
    }
    
    // Delete the room
    await Room.findByIdAndDelete(req.params.id);
    
    // Update block's room counts
    const block = await Block.findById(room.block);
    if (block) {
      block.totalRooms = Math.max(0, block.totalRooms - 1);
      if (room.status === 'Available') {
        block.availableRooms = Math.max(0, block.availableRooms - 1);
      }
      await block.save();
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid room ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get rooms by block
// @route   GET /api/blocks/:blockId/rooms
// @access  Private
exports.getRoomsByBlock = async (req, res) => {
  try {
    const rooms = await Room.find({ block: req.params.blockId })
      .populate({
        path: 'block',
        select: 'name type blockHead',
        populate: {
          path: 'blockHead',
          select: 'name email'
        }
      })
      .populate({
        path: 'createdBy',
        select: 'name'
      });

    // Get bed counts for each room
    const roomsWithBeds = await Promise.all(rooms.map(async (room) => {
      const beds = await Bed.find({ room: room._id });
      const totalBeds = beds.length;
      const availableBeds = beds.filter(bed => bed.status === 'Available').length;

      const roomObj = room.toObject();
      return {
        ...roomObj,
        totalBeds,
        availableBeds
      };
    }));

    res.status(200).json({
      success: true,
      count: roomsWithBeds.length,
      data: roomsWithBeds
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

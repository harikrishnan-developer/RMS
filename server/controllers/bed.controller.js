const Bed = require('../models/Bed');
const Room = require('../models/Room');
const Block = require('../models/Block');

// @desc    Get all beds
// @route   GET /api/beds
// @access  Private
exports.getBeds = async (req, res) => {
  try {
    // Build query
    let query;
    
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    query = Bed.find(JSON.parse(queryStr))
      .populate({
        path: 'room',
        select: 'number type block',
        populate: {
          path: 'block',
          select: 'name type'
        }
      })
      .populate({
        path: 'createdBy',
        select: 'name'
      });
    
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bed.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const beds = await query;
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: beds.length,
      pagination,
      total,
      data: beds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get beds for a specific room
// @route   GET /api/rooms/:roomId/beds
// @access  Private
exports.getRoomBeds = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room not found with id of ${req.params.roomId}`
      });
    }
    
    const beds = await Bed.find({ room: req.params.roomId })
      .populate({
        path: 'room',
        select: 'number type block',
        populate: {
          path: 'block',
          select: 'name type'
        }
      })
      .populate({
        path: 'createdBy',
        select: 'name'
      });
    
    res.status(200).json({
      success: true,
      count: beds.length,
      data: beds
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

// @desc    Get single bed
// @route   GET /api/beds/:id
// @access  Private
exports.getBed = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id)
      .populate({
        path: 'room',
        select: 'number type block',
        populate: {
          path: 'block',
          select: 'name type blockHead',
          populate: {
            path: 'blockHead',
            select: 'name email'
          }
        }
      })
      .populate({
        path: 'createdBy',
        select: 'name'
      });
    
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: `Bed not found with id of ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: bed
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid bed ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new bed
// @route   POST /api/rooms/:roomId/beds
// @access  Private (System Admin only)
exports.createBed = async (req, res) => {
  try {
    req.body.room = req.params.roomId;
    req.body.createdBy = req.user.id;
    
    const room = await Room.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Room not found with id of ${req.params.roomId}`
      });
    }
    
    // Check if bed number already exists in this room
    const existingBed = await Bed.findOne({
      room: req.params.roomId,
      bedNumber: req.body.bedNumber
    });
    
    if (existingBed) {
      return res.status(400).json({
        success: false,
        message: `Bed with number ${req.body.bedNumber} already exists in this room`
      });
    }
    
    const bed = await Bed.create(req.body);
    
    // Update block's total beds and available beds count
    const block = await Block.findById(room.block);
    if (block) {
      block.totalBeds += 1;
      block.availableBeds += 1;
      await block.save();
    }
    
    res.status(201).json({
      success: true,
      data: bed
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

// @desc    Update bed
// @route   PUT /api/beds/:id
// @access  Private (System Admin or Block Head)
exports.updateBed = async (req, res) => {
  try {
    let bed = await Bed.findById(req.params.id).populate({
      path: 'room',
      select: 'block'
    });
    
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: `Bed not found with id of ${req.params.id}`
      });
    }
    
    // If trying to update bed number, check for duplicates in the same room
    if (req.body.bedNumber) {
      const existingBed = await Bed.findOne({
        room: bed.room._id,
        bedNumber: req.body.bedNumber,
        _id: { $ne: req.params.id }
      });
      
      if (existingBed) {
        return res.status(400).json({
          success: false,
          message: `Bed with number ${req.body.bedNumber} already exists in this room`
        });
      }
    }
    
    // Check if status is changing
    let statusChanged = false;
    let oldStatus = bed.status;
    let newStatus = req.body.status;
    
    if (newStatus && oldStatus !== newStatus) {
      statusChanged = true;
    }
    
    // Update timestamp
    req.body.updatedAt = Date.now();
    
    // Update the bed
    bed = await Bed.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'room',
      select: 'block'
    });
    
    // If status changed, update block available beds count
    if (statusChanged) {
      const block = await Block.findById(bed.room.block);
      
      if (block) {
        // If changed from Available to something else, decrease available beds
        if (oldStatus === 'Available' && newStatus !== 'Available') {
          block.availableBeds = Math.max(0, block.availableBeds - 1);
        }
        // If changed from something else to Available, increase available beds
        else if (oldStatus !== 'Available' && newStatus === 'Available') {
          block.availableBeds += 1;
        }
        
        await block.save();
      }
      
      // Update room status based on beds
      await updateRoomStatus(bed.room._id);
    }
    
    res.status(200).json({
      success: true,
      data: bed
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid bed ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete bed
// @route   DELETE /api/beds/:id
// @access  Private (System Admin only)
exports.deleteBed = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id).populate({
      path: 'room',
      select: 'block'
    });
    
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: `Bed not found with id of ${req.params.id}`
      });
    }
    
    // Check if bed is occupied
    if (bed.status === 'Occupied') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an occupied bed. Please vacate the bed first.'
      });
    }
    
    // Use findByIdAndDelete instead of deprecated remove()
    await Bed.findByIdAndDelete(req.params.id);
    
    // Update block's total beds and available beds count
    const block = await Block.findById(bed.room.block);
    if (block) {
      block.totalBeds = Math.max(0, block.totalBeds - 1);
      if (bed.status === 'Available') {
        block.availableBeds = Math.max(0, block.availableBeds - 1);
      }
      await block.save();
    }
    
    // Update room status based on remaining beds
    await updateRoomStatus(bed.room._id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid bed ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Assign a bed to an occupant
// @route   PUT /api/beds/:id/assign
// @access  Private (Block Head only)
exports.assignBed = async (req, res) => {
  try {
    const { 
      name, 
      contactInfo, 
      checkInDate, 
      checkOutDate, 
      purpose 
    } = req.body;
    
    if (!name || !contactInfo || !checkInDate || !checkOutDate || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required occupant information'
      });
    }
    
    let bed = await Bed.findById(req.params.id).populate({
      path: 'room',
      select: 'block'
    });
    
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: `Bed not found with id of ${req.params.id}`
      });
    }
    
    // Check if bed is available
    if (bed.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Bed is not available for assignment'
      });
    }
    
    // Update bed status and occupant info
    bed = await Bed.findByIdAndUpdate(
      req.params.id, 
      {
        status: 'Occupied',
        occupant: {
          name,
          contactInfo,
          checkInDate,
          checkOutDate,
          purpose
        },
        updatedAt: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    // Update block's available beds count
    const block = await Block.findById(bed.room.block);
    if (block) {
      block.availableBeds = Math.max(0, block.availableBeds - 1);
      await block.save();
    }
    
    // Update room status
    await updateRoomStatus(bed.room);
    
    res.status(200).json({
      success: true,
      data: bed
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid bed ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Vacate a bed
// @route   PUT /api/beds/:id/vacate
// @access  Private (Block Head only)
exports.vacateBed = async (req, res) => {
  try {
    let bed = await Bed.findById(req.params.id).populate({
      path: 'room',
      select: 'block'
    });
    
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: `Bed not found with id of ${req.params.id}`
      });
    }
    
    // Check if bed is occupied
    if (bed.status !== 'Occupied') {
      return res.status(400).json({
        success: false,
        message: 'Bed is not currently occupied'
      });
    }
    
    // Update bed status and clear occupant info
    bed = await Bed.findByIdAndUpdate(
      req.params.id, 
      {
        status: 'Available',
        occupant: {},
        updatedAt: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    // Update block's available beds count
    const block = await Block.findById(bed.room.block);
    if (block) {
      block.availableBeds += 1;
      await block.save();
    }
    
    // Update room status
    await updateRoomStatus(bed.room);
    
    res.status(200).json({
      success: true,
      data: bed
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid bed ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to update room status based on beds
async function updateRoomStatus(roomId) {
  try {
    const beds = await Bed.find({ room: roomId });
    
    if (beds.length === 0) {
      return;
    }
    
    const occupiedCount = beds.filter(bed => bed.status === 'Occupied').length;
    const maintenanceCount = beds.filter(bed => bed.status === 'Under Maintenance').length;
    const totalUsableBeds = beds.length - maintenanceCount;
    
    let status;
    
    if (totalUsableBeds === 0) {
      status = 'Under Maintenance';
    } else if (occupiedCount === 0) {
      status = 'Available';
    } else if (occupiedCount === totalUsableBeds) {
      status = 'Fully Occupied';
    } else {
      status = 'Partially Occupied';
    }
    
    await Room.findByIdAndUpdate(roomId, { status, updatedAt: Date.now() });
  } catch (error) {
    console.error('Error updating room status:', error);
  }
}

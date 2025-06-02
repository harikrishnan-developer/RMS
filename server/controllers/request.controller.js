const AccommodationRequest = require('../models/AccommodationRequest');
const Block = require('../models/Block');
const Room = require('../models/Room');
const Bed = require('../models/Bed');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all accommodation requests
// @route   GET /api/requests
// @access  Private (Admin and System Admin only)
exports.getRequests = async (req, res) => {
  try {
    console.log('Request Controller: getRequests controller hit.');
    console.log('Request Controller: req.user:', req.user);
    
    // Build query
    let query;
    
    // Different query for different roles
    if (req.user.role === 'blockHead') {
      // Block heads can only see requests for their blocks
      const blocks = await Block.find({ blockHead: req.user.id });
      const blockIds = blocks.map(block => block._id);
      
      query = AccommodationRequest.find({ 
        blockPreference: { $in: blockIds }
      });
    } else {
      // Admins and System Admins can see all requests
      query = AccommodationRequest.find();
    }
    
    // Add filters from query parameters
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    query = query.find(JSON.parse(queryStr));
    
    // Populate related data
    query = query.populate({
      path: 'blockPreference',
      select: 'name type'
    })
    .populate({
      path: 'assignedRoom',
      select: 'number type'
    })
    .populate({
      path: 'assignedBeds',
      select: 'bedNumber status'
    })
    .populate({
      path: 'requestHandledBy.admin',
      select: 'name email'
    })
    .populate({
      path: 'requestHandledBy.blockHead',
      select: 'name email'
    })
    .populate({
      path: 'createdBy',
      select: 'name email'
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
    const total = await AccommodationRequest.countDocuments();
    
    query = query.skip(startIndex).limit(limit);
    
    // Execute query
    const requests = await query;
    
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
      count: requests.length,
      pagination,
      total,
      data: requests
    });
  } catch (error) {
    console.error('Request Controller: Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single accommodation request
// @route   GET /api/requests/:id
// @access  Private
exports.getRequest = async (req, res) => {
  try {
    const request = await AccommodationRequest.findById(req.params.id)
      .populate({
        path: 'blockPreference',
        select: 'name type',
        populate: {
          path: 'blockHead',
          select: 'name email'
        }
      })
      .populate({
        path: 'assignedRoom',
        select: 'number type block',
        populate: {
          path: 'block',
          select: 'name type'
        }
      })
      .populate({
        path: 'assignedBeds',
        select: 'bedNumber status occupant'
      })
      .populate({
        path: 'requestHandledBy.admin',
        select: 'name email'
      })
      .populate({
        path: 'requestHandledBy.blockHead',
        select: 'name email'
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      })
      .populate({
        path: 'notes.user',
        select: 'name role'
      });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Accommodation request not found with id of ${req.params.id}`
      });
    }
    
    // Check permissions for blockHead
    if (req.user.role === 'blockHead') {
      const block = await Block.findById(request.blockPreference);
      if (!block || block.blockHead.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this request'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid request ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new accommodation request
// @route   POST /api/requests
// @access  Private (Admin only)
exports.createRequest = async (req, res) => {
  try {
    // Validate block preference
    const block = await Block.findById(req.body.blockPreference);
    if (!block) {
      return res.status(404).json({
        success: false,
        message: 'Block not found'
      });
    }
    
    // Add current user as creator
    req.body.createdBy = req.user.id;
    
    // Create request
    const request = await AccommodationRequest.create(req.body);
    
    // Send notification to block head
    if (block.blockHead) {
      await Notification.create({
        recipient: block.blockHead,
        sender: req.user.id,
        type: 'New Request',
        title: 'New Accommodation Request',
        message: `A new accommodation request (${request.requestNumber}) has been created for ${block.name}`,
        relatedTo: {
          model: 'AccommodationRequest',
          id: request._id
        }
      });
    }
    
    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update accommodation request
// @route   PUT /api/requests/:id
// @access  Private
exports.updateRequest = async (req, res) => {
  try {
    let request = await AccommodationRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Accommodation request not found with id of ${req.params.id}`
      });
    }
    
    // Block head can only update if they're assigned to that block
    if (req.user.role === 'blockHead') {
      const block = await Block.findById(request.blockPreference);
      if (!block || block.blockHead.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this request'
        });
      }
      
      // Block head can only update certain fields
      const allowedUpdates = ['status', 'assignedRoom', 'assignedBeds', 'notes', 'rejectionReason'];
      
      Object.keys(req.body).forEach(key => {
        if (!allowedUpdates.includes(key)) {
          delete req.body[key];
        }
      });
      
      // Add block head to request handlers if not already there
      if (!request.requestHandledBy.blockHead) {
        req.body['requestHandledBy.blockHead'] = req.user.id;
      }
    }
    
    // Admin can update request handler
    if (req.user.role === 'admin' && !request.requestHandledBy.admin) {
      req.body['requestHandledBy.admin'] = req.user.id;
    }
    
    // Update timestamp
    req.body.updatedAt = Date.now();
    
    // Update request
    request = await AccommodationRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    // If status changed to Approved or Rejected, send notification to admin
    if (req.body.status === 'Approved' || req.body.status === 'Rejected') {
      if (request.requestHandledBy.admin) {
        await Notification.create({
          recipient: request.requestHandledBy.admin,
          sender: req.user.id,
          type: 'Request Update',
          title: `Request ${req.body.status}`,
          message: `Accommodation request (${request.requestNumber}) has been ${req.body.status.toLowerCase()}`,
          relatedTo: {
            model: 'AccommodationRequest',
            id: request._id
          }
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid request ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add note to accommodation request
// @route   POST /api/requests/:id/notes
// @access  Private
exports.addNote = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message for the note'
      });
    }
    
    const request = await AccommodationRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Accommodation request not found with id of ${req.params.id}`
      });
    }
    
    // Block head can only add notes if they're assigned to that block
    if (req.user.role === 'blockHead') {
      const block = await Block.findById(request.blockPreference);
      if (!block || block.blockHead.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to add notes to this request'
        });
      }
    }
    
    // Add note
    const note = {
      user: req.user.id,
      message,
      timestamp: Date.now()
    };
    
    request.notes.push(note);
    request.updatedAt = Date.now();
    await request.save();
    
    // Populate the newly added note with user info
    const populatedRequest = await AccommodationRequest.findById(req.params.id)
      .populate({
        path: 'notes.user',
        select: 'name role'
      });
    
    const addedNote = populatedRequest.notes[populatedRequest.notes.length - 1];
    
    res.status(200).json({
      success: true,
      data: addedNote
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid request ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Assign beds to accommodation request
// @route   POST /api/requests/:id/assign
// @access  Private (Block Head only)
exports.assignBeds = async (req, res) => {
  try {
    const { roomId, bedIds } = req.body;
    
    if (!roomId || !bedIds || !Array.isArray(bedIds) || bedIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide room ID and at least one bed ID'
      });
    }
    
    const request = await AccommodationRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Accommodation request not found with id of ${req.params.id}`
      });
    }
    
    // Check if request is pending
    if (request.status !== 'Pending' && request.status !== 'Under Review') {
      return res.status(400).json({
        success: false,
        message: `Cannot assign beds to a request with status "${request.status}"`
      });
    }
    
    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Verify room is in the correct block
    if (room.block.toString() !== request.blockPreference.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Room is not in the requested block'
      });
    }
    
    // Verify block head permission
    const block = await Block.findById(request.blockPreference);
    if (!block || block.blockHead.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign beds for this request'
      });
    }
    
    // Verify beds exist and are available
    const beds = await Bed.find({
      _id: { $in: bedIds },
      room: roomId
    });
    
    if (beds.length !== bedIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more beds not found in the specified room'
      });
    }
    
    const unavailableBeds = beds.filter(bed => bed.status !== 'Available');
    if (unavailableBeds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${unavailableBeds.length} bed(s) are not available for assignment`
      });
    }
    
    // Verify number of beds matches number of occupants
    if (beds.length < request.numberOfOccupants) {
      return res.status(400).json({
        success: false,
        message: `Request requires ${request.numberOfOccupants} beds, but only ${beds.length} provided`
      });
    }
    
    // Update request
    request.status = 'Approved';
    request.assignedRoom = roomId;
    request.assignedBeds = bedIds;
    request.requestHandledBy.blockHead = req.user.id;
    request.updatedAt = Date.now();
    await request.save();
    
    // Update beds with occupant info
    for (const bed of beds) {
      bed.status = 'Occupied';
      bed.occupant = {
        name: request.requesterName,
        contactInfo: request.requesterContact,
        checkInDate: request.checkInDate,
        checkOutDate: request.checkOutDate,
        purpose: request.purpose
      };
      bed.updatedAt = Date.now();
      await bed.save();
    }
    
    // Update room status
    await updateRoomStatus(roomId);
    
    // Update block available beds count
    block.availableBeds = Math.max(0, block.availableBeds - beds.length);
    await block.save();
    
    // Send notification to admin
    if (request.requestHandledBy.admin) {
      await Notification.create({
        recipient: request.requestHandledBy.admin,
        sender: req.user.id,
        type: 'Room Assigned',
        title: 'Room Assignment Completed',
        message: `Accommodation request (${request.requestNumber}) has been approved and assigned to room ${room.number}`,
        relatedTo: {
          model: 'AccommodationRequest',
          id: request._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: request
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

// @desc    Reject accommodation request
// @route   POST /api/requests/:id/reject
// @access  Private (Block Head only)
exports.rejectRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rejection reason'
      });
    }
    
    const request = await AccommodationRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Accommodation request not found with id of ${req.params.id}`
      });
    }
    
    // Check if request is pending or under review
    if (request.status !== 'Pending' && request.status !== 'Under Review') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a request with status "${request.status}"`
      });
    }
    
    // Verify block head permission
    const block = await Block.findById(request.blockPreference);
    if (!block || block.blockHead.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this request'
      });
    }
    
    // Update request
    request.status = 'Rejected';
    request.rejectionReason = rejectionReason;
    request.requestHandledBy.blockHead = req.user.id;
    request.updatedAt = Date.now();
    await request.save();
    
    // Send notification to admin
    if (request.requestHandledBy.admin) {
      await Notification.create({
        recipient: request.requestHandledBy.admin,
        sender: req.user.id,
        type: 'Request Rejected',
        title: 'Accommodation Request Rejected',
        message: `Accommodation request (${request.requestNumber}) has been rejected. Reason: ${rejectionReason}`,
        relatedTo: {
          model: 'AccommodationRequest',
          id: request._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid request ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Cancel accommodation request
// @route   POST /api/requests/:id/cancel
// @access  Private (Admin only)
exports.cancelRequest = async (req, res) => {
  try {
    const request = await AccommodationRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Accommodation request not found with id of ${req.params.id}`
      });
    }
    
    // Check if request can be cancelled
    if (request.status === 'Approved' || request.status === 'Rejected' || request.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a request with status "${request.status}"`
      });
    }
    
    // Update request
    request.status = 'Cancelled';
    request.updatedAt = Date.now();
    await request.save();
    
    // Send notification to block head
    if (request.requestHandledBy.blockHead) {
      await Notification.create({
        recipient: request.requestHandledBy.blockHead,
        sender: req.user.id,
        type: 'Request Update',
        title: 'Accommodation Request Cancelled',
        message: `Accommodation request (${request.requestNumber}) has been cancelled by admin`,
        relatedTo: {
          model: 'AccommodationRequest',
          id: request._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid request ID format`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete accommodation request
// @route   DELETE /api/requests/:id
// @access  Private (Admin only)
exports.deleteRequest = async (req, res) => {
  try {
    const request = await AccommodationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Accommodation request not found with id of ${req.params.id}`
      });
    }

    // Check if request has been assigned a room/bed - if so, prevent deletion
    if (request.assignedRoom || request.assignedBeds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a request that has been assigned a room or bed.'
      });
    }

    await AccommodationRequest.findByIdAndDelete(req.params.id); // Use findByIdAndDelete

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid request ID format`
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve accommodation request
// @route   POST /api/requests/:id/approve
// @access  Private (Admin and Block Head only)
// ... existing code ...

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

// @desc    Update accommodation request status
// @route   PATCH /api/requests/:id/status
// @access  Private (Admin and Block Head only)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status to update'
      });
    }

    const request = await AccommodationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Accommodation request not found with id of ${req.params.id}`
      });
    }

    // Check if the status transition is valid (optional, but good practice)
    // For simplicity, we'll allow any status update for now, assuming frontend handles valid transitions

    // Update status and add handler if applicable
    request.status = status;

    // Handle specific status transitions
    if (status === 'Completed') {
      // Logic for completing a request:
      // 1. Update status of assigned beds to 'Available'
      // 2. Clear assignedRoom and assignedBeds on the request
      if (request.assignedBeds && request.assignedBeds.length > 0) {
        for (const bedId of request.assignedBeds) {
          await Bed.findByIdAndUpdate(bedId, { status: 'Available', occupant: null, updatedAt: Date.now() });
        }
      }
      request.assignedRoom = null;
      request.assignedBeds = [];
      request.requestHandledBy.blockHead = req.user.id; // Assuming block head completes it
    } else if (status === 'Approved') {
       // Logic for approving a request (if needed, currently handled in assignBeds)
       // Ensure handler is set if not already
       if (!request.requestHandledBy.blockHead && req.user.role === 'blockHead') {
           request.requestHandledBy.blockHead = req.user.id;
       }
        if (!request.requestHandledBy.admin && req.user.role === 'admin') {
           request.requestHandledBy.admin = req.user.id;
       }

    } else if (status === 'Rejected') {
       // Logic for rejecting a request (if needed, currently handled in rejectRequest)
        if (!request.requestHandledBy.blockHead && req.user.role === 'blockHead') {
           request.requestHandledBy.blockHead = req.user.id;
       }
        if (!request.requestHandledBy.admin && req.user.role === 'admin') {
           request.requestHandledBy.admin = req.user.id;
       }
         // Clear assigned room/beds if any were assigned previously
        request.assignedRoom = null;
        request.assignedBeds = [];
         // Add rejection reason if provided (optional, could be in a separate endpoint)
         // request.rejectionReason = req.body.rejectionReason; 

    } // Add other status transitions if necessary (e.g., 'Cancelled')

    // Add handler if applicable (general case for other status changes)
     if (!request.requestHandledBy.admin && req.user.role === 'admin') {
           request.requestHandledBy.admin = req.user.id;
       }
        if (!request.requestHandledBy.blockHead && req.user.role === 'blockHead') {
           request.requestHandledBy.blockHead = req.user.id;
       }


    request.updatedAt = Date.now();
    await request.save();

    // Optionally send notification based on status change
    // This could be expanded to handle specific status transitions (Approved, Rejected, etc.)

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid request ID or status format`
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

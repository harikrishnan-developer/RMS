const Block = require('../models/Block');
const Room = require('../models/Room');
const Bed = require('../models/Bed');
const AccommodationRequest = require('../models/AccommodationRequest');
const User = require('../models/User');

// Get dashboard stats for system admin
exports.getSystemAdminStats = async (req, res) => {
  try {
    const [
      userCount,
      blockCount,
      roomCount,
      bedCount,
      requestCount
    ] = await Promise.all([
      User.countDocuments(),
      Block.countDocuments(),
      Room.countDocuments(),
      Bed.countDocuments(),
      AccommodationRequest.countDocuments({ status: 'Pending' })
    ]);

    res.json({
      userCount,
      blockCount,
      roomCount,
      bedCount,
      requestCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashboard stats for admin
exports.getAdminStats = async (req, res) => {
  try {
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      blocks
    ] = await Promise.all([
      AccommodationRequest.countDocuments(),
      AccommodationRequest.countDocuments({ status: 'Pending' }),
      AccommodationRequest.countDocuments({ status: 'Approved' }),
      AccommodationRequest.countDocuments({ status: 'Rejected' }),
      Block.find().select('name')
    ]);

    // Get availability for each block
    const blocksWithAvailability = await Promise.all(blocks.map(async (block) => {
      // Get all rooms in this block
      const rooms = await Room.find({ block: block._id }).select('_id');
      const roomIds = rooms.map(room => room._id);

      // Count beds in these rooms
      const totalBeds = await Bed.countDocuments({ room: { $in: roomIds } });
        const availableBeds = await Bed.countDocuments({ 
        room: { $in: roomIds },
          status: 'Available'
        });

        return {
          id: block._id,
          name: block.name,
          available: availableBeds,
          total: totalBeds
        };
    }));

    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      blocks: blocksWithAvailability
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashboard stats for block head
exports.getBlockHeadStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('assignedBlocks');
    if (!user.assignedBlocks || user.assignedBlocks.length === 0) {
      return res.status(400).json({ message: 'Block head is not assigned to any block' });
    }

    // Get stats for all assigned blocks
    const blockIds = user.assignedBlocks.map(block => block._id);
    const [
      totalRooms,
      totalBeds,
      availableBeds,
      pendingRequests
    ] = await Promise.all([
      Room.countDocuments({ block: { $in: blockIds } }),
      Bed.countDocuments({ block: { $in: blockIds } }),
      Bed.countDocuments({ 
        block: { $in: blockIds },
        status: 'Available'
      }),
      AccommodationRequest.countDocuments({
        blockPreference: { $in: blockIds },
        status: 'Pending'
      })
    ]);

    // Get block details
    const blocks = await Block.find({ _id: { $in: blockIds } }).select('name');

    res.json({
      blocks: blocks.map(block => block.name),
      totalRooms,
      totalBeds,
      availableBeds,
      pendingRequests,
      occupancyRate: totalBeds > 0 ? ((totalBeds - availableBeds) / totalBeds) * 100 : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
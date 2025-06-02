const mongoose = require('mongoose');

const AccommodationRequestSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    unique: true,
    required: true
  },
  requesterName: {
    type: String,
    required: [true, 'Please provide requester name'],
    trim: true
  },
  requesterContact: {
    type: String,
    required: [true, 'Please provide contact information'],
    trim: true
  },
  purpose: {
    type: String,
    required: [true, 'Please specify purpose of stay'],
    trim: true,
    maxlength: [500, 'Purpose cannot be more than 500 characters']
  },
  blockPreference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    required: [true, 'Please specify preferred block']
  },
  roomTypePreference: {
    type: String,
    enum: ['Single', 'Double', 'Triple', 'Dormitory', 'VIP Suite'],
    default: 'Single'
  },
  checkInDate: {
    type: Date,
    required: [true, 'Please specify check-in date']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Please specify check-out date']
  },
  numberOfOccupants: {
    type: Number,
    required: [true, 'Please specify number of occupants'],
    min: 1
  },
  specialRequirements: {
    type: String,
    maxlength: [500, 'Special requirements cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  assignedRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  assignedBeds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bed'
  }],
  paymentStatus: {
    type: String,
    enum: ['Not Applicable', 'Pending', 'Paid'],
    default: 'Not Applicable'
  },
  paymentAmount: {
    type: Number,
    default: 0
  },
  requestHandledBy: {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    blockHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  notes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot be more than 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate a unique request number before saving
AccommodationRequestSchema.pre('save', async function(next) {
  if (!this.requestNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.requestNumber = `REQ-${timestamp}-${random}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AccommodationRequest', AccommodationRequestSchema);

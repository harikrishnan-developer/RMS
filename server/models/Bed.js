const mongoose = require('mongoose');

const BedSchema = new mongoose.Schema({
  bedNumber: {
    type: String,
    required: [true, 'Please provide a bed number'],
    trim: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Please specify which room this bed belongs to']
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Under Maintenance'],
    default: 'Available'
  },
  occupant: {
    name: {
      type: String,
      trim: true
    },
    contactInfo: {
      type: String,
      trim: true
    },
    checkInDate: {
      type: Date
    },
    checkOutDate: {
      type: Date
    },
    purpose: {
      type: String,
      trim: true
    }
  },
  earlyVacateHistory: [{
    occupantName: {
      type: String,
      required: true,
      trim: true
    },
    originalCheckOutDate: {
      type: Date,
      required: true
    },
    vacateDate: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    contactName: {
      type: String,
      required: true,
      trim: true
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    vacatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vacatedAt: {
      type: Date,
      default: Date.now
    }
  }],
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

// Make sure bed number is unique within a room
BedSchema.index({ bedNumber: 1, room: 1 }, { unique: true });

module.exports = mongoose.model('Bed', BedSchema);

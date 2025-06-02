const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Please provide a room number'],
    trim: true
  },
  block: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    required: [true, 'Please specify which block this room belongs to']
  },
  type: {
    type: String,
    required: [true, 'Please specify room type'],
    enum: ['Single', 'Double', 'Triple', 'Dormitory', 'VIP Suite'],
    default: 'Single'
  },
  capacity: {
    type: Number,
    required: [true, 'Please specify room capacity'],
    min: 1,
    max: 20
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['Available', 'Partially Occupied', 'Fully Occupied', 'Under Maintenance'],
    default: 'Available'
  },
  amenities: {
    type: [String],
    default: []
  },
  pricePerDay: {
    type: Number,
    default: 0
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

// Make sure room number is unique within a block
RoomSchema.index({ number: 1, block: 1 }, { unique: true });

// Cascade delete beds when a room is deleted
RoomSchema.pre('remove', async function(next) {
  await this.model('Bed').deleteMany({ room: this._id });
  next();
});

module.exports = mongoose.model('Room', RoomSchema);

const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a block name'],
    trim: true,
    unique: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  type: {
    type: String,
    required: [true, 'Please specify block type'],
    enum: ['A Block', 'B Block', 'Guest House', 'SO Mess', 'Dormitory'],
    default: 'Dormitory'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  blockHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign a block head']
  },
  totalRooms: {
    type: Number,
    default: 0
  },
  availableRooms: {
    type: Number,
    default: 0
  },
  totalBeds: {
    type: Number,
    default: 0
  },
  availableBeds: {
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

// Cascade delete rooms when a block is deleted
BlockSchema.pre('remove', async function(next) {
  await this.model('Room').deleteMany({ block: this._id });
  next();
});

module.exports = mongoose.model('Block', BlockSchema);

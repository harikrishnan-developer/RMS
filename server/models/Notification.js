const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify notification recipient']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify notification sender']
  },
  type: {
    type: String,
    enum: [
      'New Request', 
      'Request Update', 
      'Room Assigned', 
      'Request Rejected', 
      'Room Vacated', 
      'Payment Required',
      'System Update'
    ],
    required: [true, 'Please specify notification type']
  },
  title: {
    type: String,
    required: [true, 'Please provide notification title'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Please provide notification message'],
    trim: true
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['AccommodationRequest', 'Room', 'Block', 'User', 'Bed'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index to query user notifications efficiently
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);

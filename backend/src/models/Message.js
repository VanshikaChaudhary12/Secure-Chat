const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  msgId: {
    type: String,
    required: true,
    unique: true
  },
  convId: {
    type: String,
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderDeviceId: {
    type: String,
    required: true
  },
  recipientIds: [{
    type: String,
    required: true
  }],
  ciphertext: {
    type: String,
    required: true
  },
  envelopeData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  deliveryReceipts: [{
    userId: String,
    deviceId: String,
    deliveredAt: Date,
    readAt: Date
  }],
  messageType: {
    type: String,
    enum: ['text', 'attachment', 'system'],
    default: 'text'
  }
}, {
  timestamps: true
});

messageSchema.index({ convId: 1, createdAt: -1 });
messageSchema.index({ recipientIds: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
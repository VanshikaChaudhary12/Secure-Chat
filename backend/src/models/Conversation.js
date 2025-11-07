const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  convId: {
    type: String,
    required: true,
    unique: true
  },
  participants: [{
    type: String,
    required: true
  }],
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: String,
  groupAdmins: [String],
  lastMessageId: String,
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
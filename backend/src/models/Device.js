const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  publicKey: {
    ed25519: {
      type: String,
      required: true
    },
    x25519: {
      type: String,
      required: true
    }
  },
  prekeyBundle: {
    identityKey: String,
    signedPrekey: String,
    prekeySignature: String,
    oneTimePrekeys: [String]
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema);
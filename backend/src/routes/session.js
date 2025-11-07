const express = require('express');
const Device = require('../models/Device');
const auth = require('../middleware/auth');

const router = express.Router();

// Session handshake
router.post('/handshake', auth, async (req, res) => {
  try {
    const { recipientUserId, handshakeData } = req.body;

    // Get recipient's devices and prekey bundles
    const recipientDevices = await Device.find({ 
      userId: recipientUserId, 
      isActive: true 
    }).select('deviceId prekeyBundle');

    if (!recipientDevices.length) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Return prekey bundles for handshake completion
    res.json({
      message: 'Handshake data retrieved',
      devices: recipientDevices,
      handshakeId: `${req.userId}-${recipientUserId}-${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
const express = require('express');
const Device = require('../models/Device');
const auth = require('../middleware/auth');

const router = express.Router();

// Get public keys for a user
router.get('/public/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const devices = await Device.find({ userId, isActive: true })
      .select('deviceId publicKey prekeyBundle');

    if (!devices.length) {
      return res.status(404).json({ error: 'User not found or no active devices' });
    }

    res.json({ devices });
  } catch (error) {
    console.error('Get public keys error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Publish prekey bundle
router.post('/prekey', auth, async (req, res) => {
  try {
    const { prekeyBundle } = req.body;

    await Device.findOneAndUpdate(
      { deviceId: req.deviceId, userId: req.userId },
      { prekeyBundle, lastSeen: new Date() }
    );

    res.json({ message: 'Prekey bundle published successfully' });
  } catch (error) {
    console.error('Publish prekey error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

module.exports = router;
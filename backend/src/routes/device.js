const express = require('express');
const Joi = require('joi');
const Device = require('../models/Device');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const enrollSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  publicKey: Joi.object({
    ed25519: Joi.string().required(),
    x25519: Joi.string().required()
  }).required(),
  prekeyBundle: Joi.object({
    identityKey: Joi.string().required(),
    signedPrekey: Joi.string().required(),
    prekeySignature: Joi.string().required(),
    oneTimePrekeys: Joi.array().items(Joi.string()).required()
  }).required()
});

// Enroll new device
router.post('/enroll', auth, async (req, res) => {
  try {
    const { error } = enrollSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, publicKey, prekeyBundle } = req.body;

    const device = new Device({
      deviceId: uuidv4(),
      userId: req.userId,
      name,
      publicKey,
      prekeyBundle
    });

    await device.save();

    await User.findOneAndUpdate(
      { userId: req.userId },
      { $push: { devices: device._id } }
    );

    res.status(201).json({
      message: 'Device enrolled successfully',
      deviceId: device.deviceId
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List user's devices
router.get('/list', auth, async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.userId, isActive: true })
      .select('deviceId name lastSeen createdAt');

    res.json({ devices });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove device
router.post('/remove', auth, async (req, res) => {
  try {
    const { deviceId } = req.body;

    await Device.findOneAndUpdate(
      { deviceId, userId: req.userId },
      { isActive: false }
    );

    res.json({ message: 'Device removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Rotate device keys
router.post('/rotatekey', auth, async (req, res) => {
  try {
    const { publicKey, prekeyBundle } = req.body;

    await Device.findOneAndUpdate(
      { deviceId: req.deviceId, userId: req.userId },
      { publicKey, prekeyBundle, lastSeen: new Date() }
    );

    res.json({ message: 'Keys rotated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Device sync
router.post('/sync', auth, async (req, res) => {
  try {
    await Device.findOneAndUpdate(
      { deviceId: req.deviceId, userId: req.userId },
      { lastSeen: new Date() }
    );

    res.json({ message: 'Device synced successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
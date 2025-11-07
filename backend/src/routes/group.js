const express = require('express');
const Joi = require('joi');
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const createGroupSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  participants: Joi.array().items(Joi.string()).min(1).required()
});

// Create new group
router.post('/create', auth, async (req, res) => {
  try {
    const { error } = createGroupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, participants } = req.body;

    const allParticipants = [req.userId, ...participants];
    const convId = uuidv4();

    const conversation = new Conversation({
      convId,
      participants: allParticipants,
      isGroup: true,
      groupName: name,
      groupAdmins: [req.userId]
    });

    await conversation.save();

    res.status(201).json({
      message: 'Group created successfully',
      convId: conversation.convId,
      groupName: name
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update group (add/remove members)
router.post('/update', auth, async (req, res) => {
  try {
    const { convId, action, userId } = req.body; // action: 'add' or 'remove'

    const conversation = await Conversation.findOne({ convId, isGroup: true });
    if (!conversation) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin
    if (!conversation.groupAdmins.includes(req.userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (action === 'add' && !conversation.participants.includes(userId)) {
      conversation.participants.push(userId);
    } else if (action === 'remove') {
      conversation.participants = conversation.participants.filter(p => p !== userId);
    }

    await conversation.save();

    res.json({ message: `User ${action}ed successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List user's groups
router.get('/list', auth, async (req, res) => {
  try {
    const groups = await Conversation.find({
      participants: req.userId,
      isGroup: true
    }).select('convId groupName participants groupAdmins lastActivity');

    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
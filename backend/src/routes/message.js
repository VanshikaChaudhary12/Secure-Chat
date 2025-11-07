const express = require('express');
const Joi = require('joi');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const sendSchema = Joi.object({
  recipientIds: Joi.array().items(Joi.string()).min(1).required(),
  ciphertext: Joi.string().required(),
  envelopeData: Joi.object(),
  messageType: Joi.string().valid('text', 'attachment', 'system').default('text')
});

// Send encrypted message
router.post('/send', auth, async (req, res) => {
  try {
    const { error } = sendSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { recipientIds, ciphertext, envelopeData, messageType } = req.body;

    // Create or get conversation
    const participants = [req.userId, ...recipientIds].sort();
    const convId = participants.join('-');

    let conversation = await Conversation.findOne({ convId });
    if (!conversation) {
      conversation = new Conversation({
        convId,
        participants,
        isGroup: recipientIds.length > 1
      });
      await conversation.save();
    }

    const message = new Message({
      msgId: uuidv4(),
      convId,
      senderId: req.userId,
      senderDeviceId: req.deviceId || 'web-device',
      recipientIds,
      ciphertext,
      envelopeData,
      messageType
    });

    await message.save();

    // Update conversation last activity
    await Conversation.findOneAndUpdate(
      { convId },
      { lastMessageId: message.msgId, lastActivity: new Date() }
    );

    res.status(201).json({
      message: 'Message sent successfully',
      msgId: message.msgId
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get unread messages
router.get('/unread', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      recipientIds: req.userId,
      'deliveryReceipts.userId': { $ne: req.userId }
    }).sort({ createdAt: -1 }).limit(100);

    res.json({ messages });
  } catch (error) {
    console.error('Get unread error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
router.post('/read', auth, async (req, res) => {
  try {
    const { msgId } = req.body;

    await Message.findOneAndUpdate(
      { msgId, recipientIds: req.userId },
      {
        $push: {
          deliveryReceipts: {
            userId: req.userId,
            deviceId: req.deviceId,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Post delivery receipt
router.post('/receipt', auth, async (req, res) => {
  try {
    const { msgId, type } = req.body; // type: 'delivered' or 'read'

    const updateData = {
      userId: req.userId,
      deviceId: req.deviceId
    };

    if (type === 'delivered') {
      updateData.deliveredAt = new Date();
    } else if (type === 'read') {
      updateData.readAt = new Date();
    }

    await Message.findOneAndUpdate(
      { msgId, recipientIds: req.userId },
      { $push: { deliveryReceipts: updateData } }
    );

    res.json({ message: 'Receipt posted successfully' });
  } catch (error) {
    console.error('Receipt error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
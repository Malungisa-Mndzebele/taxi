const express = require('express');
const Message = require('../models/Message');
const Ride = require('../models/Ride');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /api/messages/ride/{rideId}:
 *   get:
 *     summary: Get all messages for a ride
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ride not found
 */
router.get('/ride/:rideId', auth, async (req, res) => {
  try {
    const { rideId } = req.params;

    // Verify ride exists and user is part of it
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is passenger or driver of this ride
    const isPassenger = ride.passenger.toString() === req.user.id;
    const isDriver = ride.driver && ride.driver.toString() === req.user.id;

    if (!isPassenger && !isDriver) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    // Get all messages for this ride
    const messages = await Message.find({ ride: rideId })
      .populate('sender', 'firstName lastName profilePicture')
      .sort({ createdAt: 1 });

    // Mark messages as read by the current user
    const otherUserRole = isPassenger ? 'driver' : 'passenger';
    await Message.updateMany(
      { 
        ride: rideId, 
        senderRole: otherUserRole,
        isRead: false 
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      messages,
      count: messages.length
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rideId
 *               - message
 *             properties:
 *               rideId:
 *                 type: string
 *               message:
 *                 type: string
 *               messageType:
 *                 type: string
 *                 enum: [text, location, system]
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post('/', auth, async (req, res) => {
  try {
    const { rideId, message, messageType = 'text', metadata } = req.body;

    if (!rideId || !message) {
      return res.status(400).json({ message: 'Ride ID and message are required' });
    }

    // Verify ride exists and user is part of it
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is passenger or driver of this ride
    const isPassenger = ride.passenger.toString() === req.user.id;
    const isDriver = ride.driver && ride.driver.toString() === req.user.id;

    if (!isPassenger && !isDriver) {
      return res.status(403).json({ message: 'Not authorized to send messages for this ride' });
    }

    // Create message
    const newMessage = new Message({
      ride: rideId,
      sender: req.user.id,
      senderRole: isPassenger ? 'passenger' : 'driver',
      message,
      messageType,
      metadata
    });

    await newMessage.save();
    await newMessage.populate('sender', 'firstName lastName profilePicture');

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/messages/{messageId}/read:
 *   put:
 *     summary: Mark a message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message marked as read
 */
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only the recipient can mark as read
    if (message.sender.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot mark your own message as read' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    logger.error('Mark message as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/messages/unread/count:
 *   get:
 *     summary: Get unread message count
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved
 */
router.get('/unread/count', auth, async (req, res) => {
  try {
    // Get all rides where user is passenger or driver
    const rides = await Ride.find({
      $or: [
        { passenger: req.user.id },
        { driver: req.user.id }
      ],
      status: { $in: ['accepted', 'arrived', 'started'] }
    }).select('_id passenger driver');

    const rideIds = rides.map(r => r._id);
    
    // Determine user's role for each ride to count unread from the other party
    const unreadCount = await Message.countDocuments({
      ride: { $in: rideIds },
      sender: { $ne: req.user.id },
      isRead: false
    });

    res.json({
      unreadCount,
      rides: rides.length
    });
  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

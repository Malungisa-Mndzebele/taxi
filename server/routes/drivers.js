const express = require('express');
const { auth } = require('../middleware/auth');
const { User } = require('../models/User');
const router = express.Router();

// Get driver status
router.get('/status', auth, async (req, res) => {
    try {
        if (!req.user.isDriver) {
            return res.status(403).json({ error: 'Not authorized as driver' });
        }
        
        const driver = await User.findById(req.user.id);
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        res.json({ status: driver.driverStatus || 'offline' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update driver status
router.post('/status', auth, async (req, res) => {
    try {
        if (!req.user.isDriver) {
            return res.status(403).json({ error: 'Not authorized as driver' });
        }

        const { status } = req.body;
        if (!status || !['online', 'offline'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const driver = await User.findByIdAndUpdate(
            req.user.id,
            { driverStatus: status },
            { new: true }
        );

        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        res.json({ status: driver.driverStatus });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
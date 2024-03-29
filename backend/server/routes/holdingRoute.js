const express = require('express');
const router = express.Router();
const axios = require('axios');
const HoldingsModel = require('../models/holdingsModel');

// Route to get all holdings for a user
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const holdings = await HoldingsModel.find({ username });
        res.json(holdings);
    } catch (error) {
        console.error('Error fetching holdings:', error);
        res.status(500).json({ message: 'An error occurred while fetching holdings', error: error.message });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const HoldingsModel = require('../models/holdingsModel');

// Route to handle getting holdings for a username
router.get('/getHoldings/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Get holdings for the provided username
        const holdings = await HoldingsModel.find({ username });

        res.status(200).json({ holdings });
    } catch (error) {
        console.error('Error fetching holdings:', error);
        res.status(500).json({ message: 'An error occurred while fetching holdings', error: error.message });
    }
});

module.exports = router;
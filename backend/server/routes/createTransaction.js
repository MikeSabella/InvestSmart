const express = require('express');
const router = express.Router();
const axios = require('axios'); // Import axios for making HTTP requests
const TransactionModel = require('../models/transactionModel');
const UserModel = require('../models/userModel');
const HoldingsModel = require('../models/holdingsModel');

// Function to fetch current stock price from polygon.io API
async function getCurrentStockPrice(stock_name) {
    try {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 2); // Get the date of the previous day
        const formattedDate = currentDate.toISOString().slice(0, 10); // Format date as YYYY-MM-DD
        const response = await axios.get(`https://api.polygon.io/v1/open-close/${stock_name}/${formattedDate}?adjusted=true&apiKey=PIpKAl2a9S1w6fgammFWHLBX0DKkynpQ`);
        // Make an HTTP GET request to polygon.io API to fetch the current stock price
       // const response = await axios.get(`https://api.polygon.io/v1/last/stocks/${stock_name}?apiKey=PIpKAl2a9S1w6fgammFWHLBX0DKkynpQ`);
        //const response = await axios.get(`https://api.polygon.io/v1/open-close/${stock_name}/2024-03-06?adjusted=true&apiKey=PIpKAl2a9S1w6fgammFWHLBX0DKkynpQ`);
        // Extract and return the current stock price from the response
        return response.data.close;
    } catch (error) {
        console.error('Error fetching current stock price:', error);
        throw new Error('Failed to fetch current stock price');
    }
}

router.post('/createTransaction', async (req, res) => {
    try {
        const { stock_name, tran_type, tran_amount, username } = req.body;

        // Get user
        const user = await UserModel.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Buy
        if (tran_type === 'BUY') {
            if (user.cashBalance < tran_amount) {
                return res.status(400).json({ message: 'Insufficient funds for transaction' });
            }

            // Fetch current stock price
            const currentStockPrice = await getCurrentStockPrice(stock_name);
            
            // Calculate transaction amount based on current stock price
            const shares = tran_amount / currentStockPrice;

            user.cashBalance -= parseFloat(tran_amount);
            await user.save();

            const holding = await HoldingsModel.findOne({ username, stock_name });
            if (holding) {
                holding.quantity += shares;
                await holding.save();
            } else {
                const newHolding = new HoldingsModel({
                    username,
                    stock_name,
                    quantity: shares
                });
                await newHolding.save();
            }

            const newTransaction = new TransactionModel({
                stock_name,
                tran_type,
                tran_amount,
                username
            });
            await newTransaction.save();
            res.status(201).json({ message: 'Transaction created successfully', transaction: newTransaction });
        } else if (tran_type === 'SELL') {
            const holding = await HoldingsModel.findOne({ username, stock_name });
             // Fetch current stock price
            const currentStockPrice = await getCurrentStockPrice(stock_name);
            if (!holding || holding.quantity < tran_amount/currentStockPrice ) {
                return res.status(400).json({ message: 'You do not own enough stocks to sell' });
            }


            // Calculate number of shares based on current stock price
            const shares = tran_amount / currentStockPrice;

            user.cashBalance += parseFloat(tran_amount);
            await user.save();

            holding.quantity -= shares;
            await holding.save();

            const newTransaction = new TransactionModel({
                stock_name,
                tran_type,
                tran_amount,
                username
            });
            await newTransaction.save();
            res.status(201).json({ message: 'Transaction created successfully', transaction: newTransaction });
        }
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'An error occurred while creating the transaction', error: error.message });
    }
});

module.exports = router;
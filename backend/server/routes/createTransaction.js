const express = require('express');
const router = express.Router();
const TransactionModel = require('../models/transactionModel'); // Importing the TransactionModel
const UserModel = require('../models/userModel'); // Importing the UserModel
const HoldingsModel = require('../models/holdingsModel');

//THIS IS A STOCK TRANSACTION
// Route to handle creating a new transaction
router.post('/createTransaction', async (req, res) => {
    try {
        // Extract transaction data from the request body
        const { stock_name, tran_type, tran_amount, username, } = req.body;

        // Create a new transaction document using the TransactionModel
        const newTransaction = new TransactionModel({
            stock_name,
            tran_type,
            tran_amount,
            username
        });

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

            user.cashBalance -= tran_amount;
            await user.save();

            const holdingCount = await HoldingsModel.countDocuments({ username, stock_name });
            if (holdingCount>0) {
                // Update existing holding
                const holding = await HoldingsModel.findOne({ username, stock_name });
                holding.quantity += tran_amount / 100; // Add bought shares to existing holding
                await holding.save();
            } else {
                // Create new holding
                const newHolding = new HoldingsModel({
                    username,
                    stock_name,
                    quantity: tran_amount/100
                });
                
                await newHolding.save();
            }
            

            
            await newTransaction.save();
        }

        // Sell
        else if (tran_type === 'SELL') {
            // Check if we have the stock to sell
            const holding = await HoldingsModel.findOne({ username, stock_name});
            //TODO Holding might be null

            if (!holding || holding.quantity < (tran_amount/100)) {
                return res.status(400).json({ message: 'You do not own enough stocks to sell' });
            }
            
            user.cashBalance += tran_amount;

            // Decrease holding by tran_amount
            holding.quantity -= tran_amount / 100; // Subtract sold shares from holding
            await holding.save();

            // Increase cash in user record
            // TODO: need share price not 100.
            
            await user.save();

            await newTransaction.save();
            res.status(201).json({ message: 'Transaction created successfully', transaction: newTransaction });
        }
    } catch (error) {
        // If an error occurs, respond with an error message
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'An error occurred while creating the transaction', error: error.message });
}});

// Function to add to the quantity on buy orders


//Function to sell quantity and add to cashBalance on sell orders
module.exports = router;
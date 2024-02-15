const express = require('express');
const router = express.Router();
const TransactionModel = require('../models/transactionModel'); // Importing the TransactionModel
const UserModel = require('../models/userModel'); // Importing the UserModel

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

        // Save the transaction document to the database
        const savedTransaction = await newTransaction.save();

        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Save the updated user document to the database
        await user.save();

        // Respond with a success message
        res.status(201).json({ message: 'Transaction created successfully', transaction: savedTransaction});
    } catch (error) {
        // If an error occurs, respond with an error message
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'An error occurred while creating the transaction', error: error.message });
    }
});

module.exports = router;
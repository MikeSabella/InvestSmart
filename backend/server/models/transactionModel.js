const mongoose = require('mongoose');

// Define the schema for the TransactionModel
const transactionSchema = new mongoose.Schema({
    stock_name: {
        type: String,
        required: true
    },
    tran_type: {
        type: String,
        enum: ['BUY', 'SELL'], // Assuming transaction types are limited to BUY and SELL
        required: true
    },
    tran_amount: {
        type: Number,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    transaction_date: {
        type: Date,
        default: Date.now
    }
});

// Create the TransactionModel using the schema
module.exports = mongoose.model('transactions', transactionSchema);

transactionSchema.post('save', async function(doc) {
    const UserModel = require('./userModel'); // Assuming your user model is named 'userModel'

    const user = await UserModel.findOne({ username: doc.username });

    if (!user) {
        throw new Error('User not found');
    }

    await user.save();
});
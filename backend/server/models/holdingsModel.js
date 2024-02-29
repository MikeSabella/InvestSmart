const mongoose = require('mongoose');

const holdingsSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    stock_name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('holdings', holdingsSchema);
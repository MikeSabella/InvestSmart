const express = require("express");
const router = express.Router();
const newTransactionModel = require('../models/transactionModel')

router.get('/getAll', async (req, res) => {
    const transaction = await newTransactionModel.find();
    return res.json(transaction)
  })

  module.exports = router;
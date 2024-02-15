const express = require("express");
const router = express.Router();
const newTransactionModel = require('../models/transactionModel')

router.post('/deleteAll', async (req, res) => {
    const transaction = await newTransactionModel.deleteMany();
    return res.json(transaction)
  })

  module.exports = router;
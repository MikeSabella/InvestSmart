const z = require('zod');

// Validates when a new transaction is created
const newTransactionValidation = data => {
  const transactionValidationSchema = z.object({
    stock_name: z.string().nonempty('Stock ticker is required'),
    tran_type: z.string().min(3, 'Transaction type must be at least 3 characters').nonempty('Transaction type is required'),
    tran_amount: z.number().positive('Transaction amount must be a positive number').nonempty('Transaction amount is required'),
  });

  return transactionValidationSchema.safeParse(data);
};

const transactionValidation = data => {
    const transactionValidation = z.object({
      stock_name: z.string().nonempty('Stock ticker is required'),
        tran_type: z.string().min(3, 'Transaction type must be at least 3 characters').nonempty('Transaction type is required'),
        tran_amount: z.number().positive('Transaction amount must be a positive number').nonempty('Transaction amount is required'),
    });
    return transactionValidation.safeParse(data)
  };

  
module.exports.newTransactionValidation = newTransactionValidation;
module.exports.transactionValidation = transactionValidation;
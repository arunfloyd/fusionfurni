const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["credit", "debit","Debit"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    default: "completed",
  },
  paymentID :{
  type: String,
  },
});

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  balance: {
    type: Number,
    default:0
  
  },
  transactions: [transactionSchema],
});

module.exports = mongoose.model("Wallet", walletSchema);

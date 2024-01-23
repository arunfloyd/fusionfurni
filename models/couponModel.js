const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponName: {
    type: String,
    required: true,
  },
  couponCode: {
    type: String,
    required: true,
    unique: true,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
  couponDescription: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    default: function () {
      const now = new Date();
      now.setDate(now.getDate() + 30);
      return now;
    },
  },
   
  isActive: {
    type: Boolean,
    default: true,
  },
  usersUsed: [{
    type: mongoose.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);

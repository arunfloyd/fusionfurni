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
    default:  new Date('9999-12-31T23:59:59.999Z')
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

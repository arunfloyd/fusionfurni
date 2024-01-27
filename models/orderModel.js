const mongoose = require("mongoose");

var orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        price: Number,
      },
    ],
    orderId: {
      type: String,
    },
    paymentIntent: {},
    request: {
      type: String,
      default: "No Request",
      enum: [
        "No Request",
        "Request Cancellation",
        "Request Return",
        "Accept Cancellation",
        "Accept Return",
      ],
    },
    orderStatus: {
      type: String,
      default: "Not Processed",
      enum: [
        "Not Processed",
        "Processing",
        "Dispatched",
        "Cancelled",
        "Delivered",
        "Returned",
      ],
    },
    address: {
      type: Array,
    },
    orderby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  
    expectedDelivery: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);

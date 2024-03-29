const mongoose = require("mongoose");

  var cartSchema = new mongoose.Schema(
    {
      products: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          quantity: Number,
          price: Number,
          offer: {
            type: Number,
            default: null,
          },
        },
      ],
      cartTotal: Number,
      
      totalAfterDiscount: {
        type:Number,
        default:null
      },
      orderby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model("Cart", cartSchema);

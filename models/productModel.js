const mongoose = require("mongoose");

var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
     
      trim: true,
    },
    description: {
      type: String,
  
      sparse: true,
    },
    price: {
      type: Number,
      sparse: true,
      // required:true,
    },
    image: {
      type: String,
    },
    category: {
      type: String,
      sparse: true,
      // required:true,
    },
    productDetails: {
      type: String,
    },
    specification: {
      type: String,
    },
    list: {
      type: Boolean,
      default: true,
    },
    warranty: {
      type: String,
    },
    material: {
      type: String,
      // required:true,
    },
    quantity: {
      type: Number,
    },
    images: {
      type: [String],
    },
    color: {
      type: String,
      // required:true,
    },
    rating: [
      {
        star: Number,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
    autoIndex: false,
  }
);

module.exports = mongoose.model("Product", productSchema);

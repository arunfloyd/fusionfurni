const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
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

    sold: {
      type: Number,
      default: 0,
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

//Export the model
module.exports = mongoose.model("Product", productSchema);

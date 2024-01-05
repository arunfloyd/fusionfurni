const mongoose = require("mongoose");

// Create a separate schema for the address
const addressSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  mobile: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
  },
  pincode: {
    type: String,
    required: true,
  },
  addressType: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Address", addressSchema);

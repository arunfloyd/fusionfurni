const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
// const { ObjectId } = mongoose.Schema.Types;
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      // required:true,
    },
    isBlocked: {
      type: Boolean,
      default: true,
    },
    accessStatus: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: "user",
    },
    cart: {
      type: Array,
      default: [],
    },
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
//bcrypt Password
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});
//de-bcrypt Password
userSchema.methods.isPasswordMatched = async function (entedPassword) {
  return await bcrypt.compare(entedPassword, this.password);
};
//Export the model
module.exports = mongoose.model("User", userSchema);

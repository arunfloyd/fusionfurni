const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
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
      
    },
    isBlocked: {
      type: Boolean,
      default: true,
    },
    accessStatus: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "user",
    },
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    refreshToken: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
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
userSchema.methods.createPasswordResetToken = async function () {
  const resettoken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resettoken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes
  return resettoken;
};
module.exports = mongoose.model("User", userSchema);

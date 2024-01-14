const mongoose = require("mongoose");
const dbConnect = () => {
  try {
    const conn = mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {}
};
module.exports = dbConnect;

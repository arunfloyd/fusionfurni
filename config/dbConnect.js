const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {

    });

    console.log("MongoDB Connected");
    // You can do additional setup or logging here if needed.
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
};

module.exports = dbConnect;

const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://arunfloyd9497:tLgORcKeaQOvIV0v@fusion.ujatfll.mongodb.net/furniture",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("MongoDB Connected");
    // Additional setup or logging can be done here if needed.
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
};

module.exports = dbConnect;
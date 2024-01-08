const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded?.id);

      if (user) {
        // Check if the user is an admin
        if (user.role === "admin") {
          req.user = user;
          next();
        } else {
          // Redirect or handle the case where the user is not an admin
          res.redirect("/admin/login");
          throw new Error("Access denied. User is not an admin.");
        }
      } else {
        res.redirect("/admin/login");
        throw new Error("User not found.");
      }
    } else {
      res.redirect("/admin/login");
      throw new Error("There is no token attached to the header.");
    }
  } catch (error) {
    console.error(error);
    // Redirect or handle the case where authentication fails
    res.redirect("/admin/login");
    throw new Error("Authentication failed.");
  }
});

const userMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded?.id);
      req.user = user;
      next();
    } else {
      res.redirect("/login");

      throw new Error("There is no token attached to header");
    }
  } catch (error) {
    throw new Error("No Authorized token expired, Please Login again");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (adminUser.role !== "admin") {
    throw new Error("You are not an admin");
  } else {
    next();
  }
});
const noCacheHeaders = (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store, no-cache");
    next();
  } catch (error) {
    console.log("Error in cache control middleware:", error);
    throw new Error("Can't set cache control headers");
  }
};
module.exports = { authMiddleware, isAdmin, userMiddleware, noCacheHeaders };

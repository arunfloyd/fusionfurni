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
        if (user.role === "admin") {
          req.user = user;
          next();
        } else {
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
    res.redirect("/admin/login");
    throw new Error("Authentication failed.");
  }
});
const isBlocked = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const users = await User.findById({ _id: user._id });
  if (users.accessStatus !== true) {
    req.flash(
      "message",
      "Access have been Resticted..!! Please Contact Us"
    );
    res.redirect("/home");
  } else {
    next();
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
      req.flash('message','Authorized token expired, Please Login again')
      res.redirect("/login");

      throw new Error("There is no token attached to header");
    }
  } catch (error) {
    throw new Error("No Authorized token expired, Please Login again");
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
module.exports = {
  authMiddleware,
  userMiddleware,
  noCacheHeaders,
  isBlocked,
};

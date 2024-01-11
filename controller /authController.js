
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const Product = require("../models/productModel");
const nodemailer = require("nodemailer");
const Cart = require("../models/cartModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");

// login for Admin
const loginAdmin = asyncHandler(async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded?.id);
      if (user.role === "admin") {
        // Redirect to the admin dashboard
        res.redirect("/admin/dash");
      } else {
        // Handle the case where the user is not an admin
        res.render("adminLogs", {
          message: "Access denied. User is not an admin.",
        });
      }
    } else {
      res.render("adminLogs", { message: req.flash("message") });
    }
  } catch (error) {
    res.send(error);
    res.render("error");
  }
});
const loginAdminCtrl = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const adminUser = await User.findOne({ email });

    if (
      adminUser &&
      (await adminUser.isPasswordMatched(password)) &&
      adminUser.role === "admin"
    ) {
      const refreshToken = await generateRefreshToken(adminUser?._id);

      // Update the user with the new refresh token
      const updateuser = await User.findByIdAndUpdate(
        adminUser.id,
        {
          refreshToken: refreshToken,
        },
        {
          new: true,
        }
      );

      // Set the refresh token as a cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });

      // Redirect to the admin index page
      res.redirect("/admin/dash");
      res.status(200).send({ token: refreshToken });
    } else {
      // If login fails, flash an error message and redirect to the admin login page
      req.flash("message", "Invalid credentials");
      // res.render('adminLogs')
      res.redirect("/admin/login");
    }
  } catch (error) {
    // If an unexpected error occurs, flash an error message and redirect to the admin login page
    req.flash("message", "Unexpected error");
    // res.render('adminLogs')
    res.redirect("/admin/login");
  }
});

const dashboard = asyncHandler(async (req, res) => {
  try {
    const revenue1 = await Order.aggregate([
      {
        $match: {
          orderStatus: "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalRevenue: { $sum: "$paymentIntent.amount" },
        },
      },
    ]);
    const orderCount = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 }
        }
      }
    ]);
    const productCount = await Product.aggregate([{$match:{
      list:true}},
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 }
        }
      }
    ]);
    const catCount = await Category.aggregate([{$match:{
      list:true}},
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 }
        }
      }
    ]);
    const cancel = await Order.aggregate([
      {
        $match: {
          orderStatus: "Cancelled",
        },
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
        },
      },
    ]);
    const returns = await Order.aggregate([
      {
        $match: {
          orderStatus: "Returned",
        },
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
        },
      },
    ]);
    const newOrders = await User.aggregate([
      {
        $sort: { createdAt: -1 } // Assuming 'createdAt' is the timestamp field
      },
      {
        $group: {
          _id: null,
          orders: { $push: "$$ROOT" } // Use $$ROOT to include the whole document
        }
      }
    ]);
    const categoryCount =catCount[0].totalCount
    const totalCount= orderCount[0].totalCount
    const revenue=revenue1[0].totalRevenue
    const productsCount= productCount[0].totalCount
    const returnCount = returns[0].totalCount
    const cancelCount = cancel[0].totalCount
    const completeCount = revenue1[0].totalCount
//Calculate the Percentage    
    const returnPercentage = (returnCount / totalCount) * 100
    const cancelledPercentage = (cancelCount / totalCount) * 100;
    const completedPercentage = (completeCount / totalCount) * 100;
 
    res.render("adminDash/indexHome",{revenue,totalCount,productsCount,categoryCount,returnPercentage,cancelledPercentage,completedPercentage,newOrders});
  } catch (error) {
    res.send(error);
    res.render("error");
  }
});
//Product List

const product = asyncHandler(async (req, res) => {
  try {
    res.render("adminDash/indexProductList");
  } catch (error) {
    res.send(error);
    res.render("error");
    // throw new Error("Product list can not Access")
  }
});
//Add Product
const addProduct = asyncHandler(async (req, res) => {
  try {
    res.render("adminDash/indexAddProduct");
  } catch (error) {
    // throw new Error("Add Product Can not Access")
    res.send(error);
    res.render("error");
  }
});

//Add Category

const addCategory = asyncHandler(async (req, res) => {
  try {
    res.render("adminDash/indexAddCategory");
  } catch (error) {
    // throw new Error("Add Product Can not Access")
    res.send(error);
    res.render("error");
  }
});

//User List

const getallUser = asyncHandler(async (req, res) => {
  try {
    res.render("adminDash/indexUserList");
  } catch (error) {
    // throw new Error ("User List can not Access")
    res.send(error);
    res.render("error");
  }
});
const userList = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.render("adminDash/indexUserList", {
      users: getUsers,
      message: req.flash("message"),
    });
    console.log(getUsers.name);
    // res.json(getUsers);
  } catch (err) {
    // throw new Error(error)
    res.send(error);
    res.render("error");
  }
});
const loadaUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render("adminDash/edit-user", { user: userData });
    } else {
      res.redirect("/admin/dash");
    }
  } catch (error) {
    // console.log(error.message)
    res.send(error);
    res.render("error");
  }
});

const updateaUser = asyncHandler(async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      { _id: req.body.id },
      { $set: { accessStatus: req.body.accessStatus } }
    );

    res.redirect("/admin/users");
  } catch (error) {
    // throw new Error(error)
    res.send(error);
    res.render("error");
  }
});
const loadDelete = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userData = await User.findById(id);
    if (userData) {
      res.render("adminDash/delete-user", {
        userData: userData,
        message: req.flash("message"),
      });
    } else {
      res.redirect("/admin/dash");
    }
  } catch (error) {
    // console.log(error.message)
    res.send(error);
    res.render("error");
  }
});

const deleteaUser = async (req, res) => {
  try {
    await User.deleteOne({ _id: req.query.id });
    req.flash("message", "Deleted the User Sucessfully");
    res.redirect("/admin/users");
  } catch (error) {
    // console.log(error.message)
    res.send(error);
    res.render("error");
  }
};

const loadDeleteUser = async (req, res) => {
  try {
    await User.deleteOne({ _id: req.query.id });
    res.redirect("/admin/dashboard");
  } catch (error) {
    // console.log(error.message)
    res.send(error);
    res.render("error");
  }
};
const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // validateMongoDbId(id);
  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
    // throw new Error(error)
    res.send(error);
    res.render("error");
  }
});

const accessOn = async (req, res) => {
  try {
    const categoryId = req.body.categoryId;
    const category = await User.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    category.accessStatus = !category.accessStatus;
    await category.save();
    res.json({
      success: true,
      message: "Category status updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
const accessOff = async (req, res) => {
  try {
    const categoryId = req.body.categoryId;
    const category = await User.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    category.accessStatus = !category.accessStatus;
    await category.save();
    res.json({
      success: true,
      message: "Category status updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
const updateCategoryStatus = async (req, res) => {
  try {
    const categoryId = req.body.categoryId;
    const category = await User.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    category.accessStatus = !category.accessStatus;
    await category.save();
    res.json({
      success: true,
      message: "Category status updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
const logout = asyncHandler(async (req, res) => {
  try {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");

    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });

    if (!user) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
      });
      return res.sendStatus(204); // Forbidden
    }

    await User.findOne(
      { refreshToken: refreshToken },
      {
        refreshToken: "",
      }
    );

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });

    // Add cache control headers to prevent caching
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    req.flash("message", " Logout Successfully ");
    res.redirect("/admin/login");
    res.sendStatus(204);
  } catch {
    res.send(error);
    res.render("error");
  } // Forbidden
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const userorders = await Order.find({})
      .populate({
        path: "products.product",
        select: "title images price", // Select the fields you want to populate
      })
      .populate({
        path: "orderby",
        select: "name", // Assuming user has a "name" field
      })
      .exec();

    res.render("adminDash/indexOrders", { userorders: userorders });
  } catch (error) {
    throw new Error(error);
  }
});
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { payment, orderStatus, paymentId, amount, method, created } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.findByIdAndUpdate(
      id,
      {
        id: paymentId,
        orderStatus: payment,
        paymentIntent: {
          status: orderStatus,
          amount: amount,
          method: method,
          created: created,
        },
      },
      { new: true }
    );
    res.redirect("/admin/orders");
  } catch (error) {
    throw new Error(error);
  }
});
const loadUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  // validateMongoDbId(_id);
  try {
    const userorders = await Order.findOne({ _id: id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    console.log(userorders);
    res.render("adminDash/editOrderStatus", { userorders: userorders });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  loginAdminCtrl,
  getallUser,
  deleteaUser,
  getaUser,
  loginAdmin,
  dashboard,
  userList,
  addCategory,
  addProduct,
  product,
  loadaUser,
  updateaUser,
  loadDelete,
  loadDeleteUser,
  accessOff,
  accessOn,
  updateCategoryStatus,
  logout,
  updateOrderStatus,
  getAllOrders,
  loadUpdateOrderStatus,
};

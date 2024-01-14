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
          totalCount: { $sum: 1 },
        },
      },
    ]);
    const productCount = await Product.aggregate([
      {
        $match: {
          list: true,
        },
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
        },
      },
    ]);
    const catCount = await Category.aggregate([
      {
        $match: {
          list: true,
        },
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
        },
      },
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
    const userorders = await Order.find()
      .populate("products.product")
      .populate("orderby")
      .exec();
    const currentYear = new Date().getFullYear();

    const ordersByMonth = await Order.aggregate([
      // Match orders within the specified year
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
        },
      },
      // Group orders by month
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 }, // Count the number of orders in each month
        },
      },
      // Sort results by month in ascending order
      { $sort: { "_id.month": 1 } },
    ]);
    const currentMonth = new Date().getMonth();
    const ordersByDay = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 1), // Start of this month
            $lt: new Date(currentYear, currentMonth + 1, 1), // Start of next month
          },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" }, // Group by day of the month
          },
          count: { $sum: 1 }, // Count orders for each day
        },
      },
      {
        $sort: { "_id.day": 1 }, // Sort results chronologically by day
      },
    ]);
    const userByMonth = await User.aggregate([
      // Match users within the specified year
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
        },
      },
      // Group users by month
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 }, // Count the number of users in each month
        },
      },
      // Sort results by month in ascending order
      { $sort: { "_id.month": 1 } },
    ]);

    const userCounts = Array(20).fill(0);
    // Initialize an array with 12 zeros

    userByMonth.forEach((monthlyCount) => {
      const month = monthlyCount._id.month - 1; // Access the month of the year (subtract 1 to make it zero-based)
      userCounts[month] = monthlyCount.count; // Access the number of users for that month
    });

    const dailyCounts = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
    ];
    ordersByDay.forEach((dailyCount) => {
      const day = dailyCount._id.day; // Access the day of the month
      dailyCounts[day] = dailyCount.count; // Access the number of orders for that day
    });

    const monthlyCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Initialize an array for each month

    // Assuming cancels is the result you obtained
    ordersByMonth.forEach((item) => {
      const month = item._id.month - 1; // Months are zero-based in JavaScript
      monthlyCounts[month] = item.count;
    });

    const newUsers = await User.find();
    // Assuming userorder
    const categoryCount = catCount[0].totalCount;
    const totalCount = orderCount[0].totalCount;
    const revenue = revenue1[0].totalRevenue;
    const productsCount = productCount[0].totalCount;
    const returnCount = returns[0].totalCount;
    const cancelCount = cancel[0].totalCount;
    const completeCount = revenue1[0].totalCount;
    //Calculate the Percentage
    const returnPercentage = (returnCount / totalCount) * 100;
    const cancelledPercentage = (cancelCount / totalCount) * 100;
    const completedPercentage = (completeCount / totalCount) * 100;
    res.render("adminDash/indexHome", {
      revenue,
      totalCount,
      productsCount,
      categoryCount,
      returnPercentage,
      cancelledPercentage,
      completedPercentage,
      userorders,
      newUsers,
      monthlyCounts,
      dailyCounts,
      userCounts,
      completeCount,
    });
  } catch (error) {
    res.send(error);
    res.render("error");
  }
});
//Product List

// const product = asyncHandler(async (req, res) => {
//  const ITEMS_PER_PAGE = 8;
//   try {
//     var search = '';
//     var sortOrder = '';
//     if (req.query.Search ||req.query.Sort ) {
//         search = req.query.Search;
//         sortOrder=req.query.Sort;
//     }
//     const sortingOptions = {
//       default: { }, // Add your default sorting option here
//       priceHigh: { price: -1 },
//       priceLow: { price: 1 }
//     };
//     const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
//     const totalProducts = await Product.countDocuments({
//       $and: [
//         {
//           $or: [
//             { title: { $regex: '.*' + search + '.*', $options: 'i' } },
//           ]
//         }
//       ]
//     });
//     const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
//     const skip = (page - 1) * ITEMS_PER_PAGE;
//     const usersData = await Product.find({
//       $and: [
//           {
//               $or: [
//                   { title: { $regex: '.*' + search + '.*', $options: 'i' } },
//               ]
//           }
//       ]
//   }).sort(sortingOptions[sortOrder]).skip(skip)
//   .limit(ITEMS_PER_PAGE);

//   res.render('adminDash/indexProductList', {
//     currentPage: page,
//     getallProduct: usersData,

//     totalPages: totalPages,
//     search: search ,
//     sortOrder: sortOrder,

//   });
//   } catch (error) {
//     console.error(error);
//     res.render("error");
//   }
// });

const product = asyncHandler(async (req, res) => {
  try {
    res.render("admin/indexProductList");
  } catch (error) {
    throw new Error(error);
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
    const ITEMS_PER_PAGE = 8;

    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const usersData = await User.find()
      .skip(skip)
      .limit(ITEMS_PER_PAGE);
    // const getUsers = await User.find();
    res.render("adminDash/indexUserList", {
      users: usersData, currentPage: page,
      totalPages: totalPages,
      
      message: req.flash("message"),
    });
    console.log(usersData.name);
    // res.json(getUsers);
  } catch (error) {
    throw new Error(error)
  
    // res.render("error");
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
    const ITEMS_PER_PAGE = 8;

    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const userorders = await Order.find({})
      .populate({
        path: "products.product",
        select: "title images price",
      })
      .populate({
        path: "orderby",
        select: "name",
      })
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .exec();

    res.render("adminDash/indexOrders", {
      userorders: userorders,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error(error);
    res.render("error");
  }
});


const updateOrderStatus = asyncHandler(async (req, res) => {
  const { payment, orderStatus, paymentId, amount, method, created ,request} = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.findByIdAndUpdate(
      id,
      {
        id: paymentId,
        request:request,
        orderStatus: orderStatus,
        paymentIntent: {
          status: payment,
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

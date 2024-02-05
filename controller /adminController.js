const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const Wallet = require("../models/walletModel");
const puppeteer = require('puppeteer');
const fs = require('fs')
const pdf = require("pdf-creator-node");
const path = require('path')


// login for Admin
const loginAdmin = asyncHandler(async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded?.id);
      if (user.role === "admin") {
        res.redirect("/admin/dash");
      } else {
        res.render("adminLogs", {
          message: "Access denied. User is not an admin.",
        });
      }
    } else {
      res.render("adminLogs", { message: req.flash("message") });
    }
  } catch (error) {
    res.render("error");
  }
});
const loginAdminCtrl = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminUser = await User.findOne({ email });

    if (
      adminUser &&
      (await adminUser.isPasswordMatched(password)) &&
      adminUser.role === "admin"
    ) {
      const refreshToken = await generateRefreshToken(adminUser?._id);

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

      res.redirect("/admin/dash");
      res.status(200).send({ token: refreshToken });
    } else {
      req.flash("message", "Invalid credentials");
      res.redirect("/admin/login");
    }
  } catch (error) {
    req.flash("message", "Unexpected error");
    res.redirect("/admin/login");
  }
});

const salesGetReport = asyncHandler(async (req, res) => {
  try {
    let matchStage = {
      orderStatus: "Delivered",
    };

    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    console.log(startDate,endDate)

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const userorders = await Order.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "populatedProducts",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "orderby",
          foreignField: "_id",
          as: "populatedOrderBy",
        },
      },
    ]);
console.log("List",userorders);
    const grandTotal = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$paymentIntent.amount" },
        },
      },
    ]);
    console.log("List",grandTotal);

    const totalAmount = grandTotal.length > 0 ? grandTotal[0].totalAmount : 0;
    if (startDate) {
      res.send({
        userorders,
        grandTotal,
        totalAmount
      });
    } else {
      res.render("adminDash/salesReport", {
        userorders,
        grandTotal,
        totalAmount,
      });
    }
    
    
  } catch (error) {
    console.error("An error occurred in the salesPostReport route:", error);
    res.status(500).send("Internal Server Error");
  }
});

const salesReport = asyncHandler(async (req, res) => {
  try {
    console.log("Request Body:", req.query);
    console.log("Request Body:", req.body);

    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    console.log("Start Date:", parsedStartDate, "End Date:", parsedEndDate);

    const matchStage = {
      $match: {
        orderStatus: "Delivered",
        $expr: {
          $and: [
            { $gte: ["$createdAt", parsedStartDate] },
            { $lte: ["$createdAt", parsedEndDate] },
          ],
        },
      },
    };

    const userorders = await Order.aggregate([
      matchStage,
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "populatedProducts",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "orderby",
          foreignField: "_id",
          as: "populatedOrderBy",
        },
      },
    ]);

    const grandTotal = await Order.aggregate([
      matchStage,
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$paymentIntent.amount" },
        },
      },
    ]);

    const totalAmount = grandTotal.length > 0 ? grandTotal[0].totalAmount : 0;

    console.log("hello");
    console.log("userorders:", userorders);
    console.log("grandTotal:", grandTotal);
    console.log("totalAmount:", totalAmount);

    res.render("adminDash/salesReport", {
      userorders,
      grandTotal,
      totalAmount,
    });
  } catch (error) {
    console.error("An error occurred in the salesReport route:", error);
    res.status(500).send("Internal Server Error");
  }
});

const dashboard = asyncHandler(async (req, res) => {
  try {
    let revenue1,
      orderCount,
      productCount,
      catCount,
      cancel,
      returns,
      userorders,
      ordersByMonth,
      currentMonth,
      ordersByDay,
      userByMonth,
      userCounts,
      dailyCounts,
      monthlyCounts,
      newUsers;

    // Aggregation for revenue
    revenue1 = await Order.aggregate([
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
    // Aggregation for order count
    orderCount = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
        },
      },
    ]);

    // Aggregation for product count
    productCount = await Product.aggregate([
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

    // Aggregation for category count
    catCount = await Category.aggregate([
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

    cancel = await Order.aggregate([
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

    returns = await Order.aggregate([
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

    userorders = await Order.find()
      .populate("products.product")
      .populate("orderby")
      .exec();

    const currentYear = new Date().getFullYear();
    ordersByMonth = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    currentMonth = new Date().getMonth();

    ordersByDay = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.day": 1 },
      },
    ]);

    // Aggregation for users by month
    userByMonth = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    // Initialize arrays for chart data
    userCounts = Array(20).fill(0);
    dailyCounts = Array(31).fill(0);
    monthlyCounts = Array(12).fill(0);

    // Populate data for userCounts
    userByMonth.forEach((monthlyCount) => {
      const month = monthlyCount._id.month - 1;
      userCounts[month] = monthlyCount.count;
    });

    // Populate data for dailyCounts
    ordersByDay.forEach((dailyCount) => {
      const day = dailyCount._id.day;
      dailyCounts[day - 1] = dailyCount.count; // day is 1-based, so subtract 1
    });

    // Populate data for monthlyCounts
    ordersByMonth.forEach((item) => {
      const month = item._id.month - 1;
      monthlyCounts[month] = item.count;
    });

    // Fetch new users
    newUsers = await User.find();

    // Assuming userorder
    const categoryCount = catCount[0].totalCount;
    const totalCount = orderCount[0].totalCount;
    console.log("heelo", cancel);
    const revenue = revenue1[0]?.totalRevenue || 0;
    const productsCount = productCount[0].totalCount;
    const returnCount = returns[0].totalCount;
    const cancelCount = cancel[0].totalCount;
    console.log(cancelCount);
    const completeCount =
      (revenue1 && revenue1[0] && revenue1[0].totalCount) || 0;

    const totalEarning = revenue1[0].totalRevenue * 0.75;
    console.log(totalEarning);

    // Calculate percentages
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
      totalEarning,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    throw new Error(error);
  }
});

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
    res.render("error");
  }
});

//Add Category

const addCategory = asyncHandler(async (req, res) => {
  try {
    res.render("adminDash/indexAddCategory");
  } catch (error) {
    res.render("error");
  }
});

//User List

const getallUser = asyncHandler(async (req, res) => {
  try {
    res.render("adminDash/indexUserList");
  } catch (error) {
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
    const usersData = await User.find().skip(skip).limit(ITEMS_PER_PAGE);
    res.render("adminDash/indexUserList", {
      users: usersData,
      currentPage: page,
      totalPages: totalPages,
      message: req.flash("message"),
    });
  } catch (error) {
    throw new Error(error);
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
    res.render("error");
  }
});

const deleteaUser = async (req, res) => {
  try {
    await User.deleteOne({ _id: req.query.id });
    req.flash("message", "Deleted the User Sucessfully");
    res.redirect("/admin/users");
  } catch (error) {
    res.render("error");
  }
};

const loadDeleteUser = async (req, res) => {
  try {
    await User.deleteOne({ _id: req.query.id });
    res.redirect("/admin/dashboard");
  } catch (error) {
    res.render("error");
  }
};
const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
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
    res.render("error");
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { payment, orderStatus, paymentId, amount, method, created, request } =
    req.body;
  const { id } = req.params;
  console.log("or", orderStatus);
  console.log("o2r", amount);

  validateMongoDbId(id);
  try {
    const userorders = await Order.findByIdAndUpdate(
      id,
      {
        $set: { orderStatus: orderStatus },
      },
      { new: true }
    );
    if (orderStatus === "Returned") {
      const _id = userorders.orderby;
      const paymentAmount = Number(userorders.paymentIntent.amount);
      console.log(paymentAmount)
      console.log(_id)

      let userWallet = await Wallet.findOne({ user: _id });
      if (!userWallet) {
        userWallet = new Wallet({
          user: _id,
          balance: 0,
          transactions: [],
        });
      }
      userWallet.balance += paymentAmount;
      userWallet.transactions.push({
        type: "credit",
        amount: paymentAmount,
        description: "Return Amount has been added",
        paymentID: "ReturnMoney",
      });
      await userWallet.save();
    }

    res.redirect("/admin/orders");
  } catch (error) {
    console.error(error)
    throw new Error(error);
  }
});
const loadUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // validateMongoDbId(_id);
  try {
    const userorders = await Order.findOne({ _id: id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.render("adminDash/editOrderStatus", { userorders: userorders });
  } catch (error) {
    throw new Error(error);
  }
});
const generatePdf = async (req, res) => {
  try {
    const startDate = req.query.startDate || '1970-01-01';
const endDate = req.query.endDate || new Date().toISOString(); 

const browser = await puppeteer.launch();
const page = await browser.newPage();
const userorder = await Order.find({
  createdAt: {
    $gte: new Date(startDate),
    $lt: new Date(endDate)
  },
  orderStatus: 'Delivered'
})
.populate("products.product")
.populate("orderby")
.populate("address")
.exec();
const aggregationResult = await Order.aggregate([
  {
    $match: {
      createdAt: {
        $gte: new Date(startDate),
        $lt: new Date(endDate)
      },
      orderStatus: 'Delivered'
    }
  },
  {
    $group: {
      _id: null,
      totalAmount: { $sum: "$paymentIntent.amount" },
    }
  }
]);
const totalAmount = aggregationResult.length > 0 ? aggregationResult[0].totalAmount : 0;
const data = {
  prodlist: userorder.flatMap(order => 
    order.products.map((productItem, index, array) => {
      let productInfo = {
        'Product Title': productItem.product.title,
      };

      if (productItem.offer !== null && typeof productItem.offer !== 'undefined') {
        productInfo['Original Product Price'] = productItem.product.price;
        productInfo['Discounted Price'] = productItem.price;

        const savings = productItem.product.price - productItem.price;
        const discountPercentage = (savings / productItem.product.price) * 100;
        productInfo['Savings'] = `Discount: ${discountPercentage.toFixed(2)}`;
      } else {
        productInfo['Product Price'] = productItem.product.price;
      }

      return productInfo;
    })
  ),
};


const html = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }

        .company-heading {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }

        h1 {
          text-align: center;
          color: #333;
        }

        ul {
          list-style-type: none;
          padding: 0;
        }

        li {
          margin-bottom: 10px;
        }

        p {
          margin-top: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        th {
          background-color: #f2f2f2;
        }

        .invoice-details {
          border-top: 2px solid #333;
          padding-top: 10px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="company-heading">FUSIONFURNI</div>
      <ul>
          <li>Kinfra Kakkancheri</li>
          <li>Near Calicut University</li>
          <li>Kozhikode</li>
          <li>67122</li>
        </ul>
      <hr>

      <h1>Invoice</h1>
      <hr>
     
      <table>
        <thead>
          <tr>
          
            <th>Product Title</th>
            <th>Original Product Price</th>
            <th>Discounted Price</th>
            <th>Savings %</th>
            
          </tr>
        </thead>
        <tbody>
         
            <tr>
            ${data.prodlist.map(product => `
              <td>${product['Product Title']}</td>
              <td>${product['Original Product Price'] ? `₹${product['Original Product Price']}` : ''}</td>
              <td>${product['Discounted Price'] ? `₹${product['Discounted Price']}` : ''}</td>
              <td>${product['Savings'] ? `${product['Savings']}` : ''}</td>
              <td>${product['Product Price'] ? `₹${product['Product Price']}` : ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>


      <div class="invoice-details">
      <p>Total Amount : ${totalAmount}</p>
        <p>Invoice ID: ${generateInvoiceID()}</p>
        <p>Invoice Date: ${new Date().toLocaleDateString("en-GB")}</p>
      </div>
    </body>
  </html>
`;

function generateInvoiceID() {
  return Math.floor(1000 + Math.random() * 9000);
}


    await page.setContent(html);

    const filename = Math.random() + '_doc' + '.pdf';
    const filepath = path.join(__dirname, 'docs', filename);

    await page.pdf({
      path: filepath,
      format: 'A4',
      displayHeaderFooter: true,
      headerTemplate: '<h4 style="color: red; font-size: 20; font-weight: 800; text-align: center;">CUSTOMER INVOICE</h4>',
      footerTemplate: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
    });

    await browser.close();

    if (fs.existsSync(filepath)) {
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error initiating download');
        }
    
        fs.unlinkSync(filepath);
      });
    } else {
      res.status(404).send('PDF file not found');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Error generating PDF');
  }
};
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
  salesReport,
  salesGetReport,
  generatePdf,
  
};

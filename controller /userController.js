const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const Product = require("../models/productModel");
const nodemailer = require("nodemailer");
const Cart = require("../models/cartModel");
const Category = require("../models/categoryModel");
const Coupon = require("../models/couponModel");
const Otp = require("../models/otpModel");
const bcrypt = require("bcrypt");
const Order = require("../models/orderModel");
const Address = require("../models/addressModel");
const uniqid = require("uniqid");
const sendEmail = require("./emailController");
const crypto = require("crypto");
const otpGenerator = require("otp-generator");
const orderid = require("order-id")("key");
const Razorpay = require("razorpay");
const WishList = require("../models/wishListModel");
const { elements } = require("chart.js");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
const Wallet = require("../models/walletModel");
const { OfferAssociation, Offer } = require("../models/offerModel");
const fs = require('fs')
const pdf = require("pdf-creator-node");
const path = require('path')
const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});
const puppeteer = require('puppeteer');
const generatePdf = async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
const id =req.params.id ;
const userorder = await Order.findById({ _id: id })
.populate("products.product")
.populate("orderby")
.populate("address")
.exec();
console.log(userorder)
const data = {
  prodlist: userorder.products.map((productItem, index, array) => {
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
  }),
  Address: {
    name: userorder.address[0].name,
    mobile: userorder.address[0].mobile,
    street: userorder.address[0].street,
    area: userorder.address[0].area,
    landmark: userorder.address[0].landmark,
    pincode: userorder.address[0].pincode,
  },
  subtotal: userorder.paymentIntent.amount, // Example data, replace with actual subtotal calculation
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
      <b><p>Address:</b>
        <ul>
          <li>Name: ${data.Address.name}</li>
          <li>Mobile: ${data.Address.mobile}</li>
          <li>Street: ${data.Address.street}</li>
          <li>Area: ${data.Address.area}</li>
          <li>Landmark: ${data.Address.landmark}</li>
          <li>Pincode: ${data.Address.pincode}</li>
        </ul>
      </p>
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
          ${data.prodlist.map(product => `
            <tr>
              <td>${product['Product Title']}</td>
              <td>${product['Original Product Price'] ? `₹${product['Original Product Price']}` : ''}</td>
              <td>${product['Discounted Price'] ? `₹${product['Discounted Price']}` : ''}</td>
              <td>${product['Savings'] ? `${product['Savings']}` : ''}</td>
              <td>${product['Product Price'] ? `₹${product['Product Price']}` : ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

     <b><p>Subtotal: ₹${data.subtotal}</p></b> 

      <div class="invoice-details">
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

    // Sending the file for download
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error initiating download');
      }

    fs.unlinkSync(filepath);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error generating PDF');
  }
};

const loadlogin = asyncHandler(async (req, res) => {
  try {
    if (req.cookies.refreshToken) {
      res.redirect("/home");
    } else {
      res.render("user/loginAndSignUp", { message: req.flash("message") });
    }
  } catch (error) {
    res.render("error");
  }
});
const loginUserCtrl = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const findUser = await User.findOne({ email });

    if (
      findUser &&
      (await findUser.isPasswordMatched(password)) &&
      !findUser.isBlocked
    ) {
      const refreshToken = await generateRefreshToken(findUser?._id);
      const updateuser = await User.findByIdAndUpdate(
        findUser.id,
        {
          refreshToken: refreshToken,
        },
        {
          new: true,
        }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });

      res.redirect("/home");
    } else {
      req.flash("message", "Invalid Credentials");
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/login", { message: "An error occurred" });
  }
});
const userRegister = asyncHandler(async (req, res) => {
  try {
    res.render("user/loginAndSignUp", { message: req.flash("message") });
  } catch (error) {
    console.error("error is", error);
    throw new Error(error);
  }
});const createUser = asyncHandler(async (req, res) => {
  try {
    const refer = req.params.profileId;
    let referId;
    console.log(refer)
    const email = req.body.email;
    const mobile = req.body.mobile;
    const mob = await User.findOne({ mobile: mobile });
    const findUser = await User.findOne({ email: email });

    if (!findUser && !mob) {
      if (refer) {
        referId = refer;
        let userWallet = await Wallet.findOne({ user: refer });    
        if (!userWallet) {
          // Create a new wallet if it doesn't exist
          userWallet = new Wallet({
            user: refer,
            balance: 0,
            transactions: [],
          });
        }
    
        const parsedAmount = 100;
    
        userWallet.balance += parsedAmount;
        userWallet.transactions.push({
          type: "credit",
          amount: parsedAmount,
          description: "Added 100 for Referring a friend",
          paymentID: "Refer & Earn",
        });    
        // Save or update the userWallet
        await userWallet.save();
      } else {
        referId = null; // or some default value
      }
    
      const newUser = await User.create({
        ...req.body,
        referrer: referId,
      });

      const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      const salt = await bcrypt.genSalt(10);
      const encryptedOtp = await bcrypt.hash(otp, salt);
      const otps = new Otp({
        otp: encryptedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        user: newUser._id,
      });
      await otps.save();
      const resetURL = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #007BFF;">Verify Your Email</h2>
      <p>Hi, To authenticate, please use the following One Time Password (OTP)</p>
      <div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin: 0; color: #007BFF;"> ${otp}</h3>
      </div>
      <p>Don't share this OTP with anyone. Our customer service team will never ask you for your password, OTP, credit card, or banking info.</p>
      <p>If you did not request this verification, Please ignore this email.</p>
      <p> We hope to see you again soon.</p>

      <P style="color: #007BFF;">From Fushion Furni </p>
  </div>`;

      const data = {
        to: email,
        text: "Hey User",
        subject: "OTP Verification ",
        htm: resetURL,
      };
      await sendEmail(data);
      res.render('user/verifyEmail',{email,message: req.flash("message")});
    } else {
      req.flash("message", "User Already Exists");
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    if (error.errors && error.errors.referrer) {
      req.flash("message", "Invalid Referrer. Please try again.");
    } else {
      req.flash("message", "An error occurred during user creation.");
    }

    res.render("user/loginAndSignUp", { email: req.body.email });
  }
});
const loadVerifyEmail = asyncHandler(async (req, res) => {
  try {
    const email = req.query.email;
    res.render("user/verifyEmail", { email, message: req.flash("message") });
  } catch (error) {
    throw new Error(error);
  }
});
const verifyMail = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email;
    console.log(email)
    const user = await User.findOne({
      email: email  
      });
    console.log("user",user)

    if (user) {
      const enteredOTP = req.body.otp;
      const storedOtp = await Otp.findOne({ user: user._id });
      console.log("otp",storedOtp)

      if (storedOtp) {
        const isMatch = await bcrypt.compare(enteredOTP, storedOtp.otp);
      console.log("match",isMatch)
        if (isMatch) {
          req.flash("message", "User Successfully Verified");
          res.redirect("/login");
        } else {
          req.flash("message", "Entered OTP is Wrong");
          res.render('user/verifyEmail',{ email, message: req.flash("message") });
        }
      } else {
        req.flash("message", "Time Expired, Please try after sometimes");
        res.render('user/verifyEmail',{ email, message: req.flash("message") });
      }
    } else {
      req.flash("message", "User not found");
      res.render('user/verifyEmail',{ email, message: req.flash("message") });
    }
  } catch (error) {
    console.error("error",error)
    req.flash("message", "An error occurred during OTP verification");
    res.render('user/verifyEmail',{ email, message: req.flash("message") });
  }
});
const resendMail = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const salt = await bcrypt.genSalt(10);
    const encryptedOtp = await bcrypt.hash(otp, salt);
    await Otp.findOneAndUpdate(
      { user: user._id },
      { otp: encryptedOtp, expiresAt: new Date(Date.now() + 1 * 60 * 1000) }
    );

    const resetURL = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #007BFF;">Verify Your Email</h2>
      <p>Hi, To authenticate, please use the following One Time Password (OTP)</p>
      <div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin: 0; color: #007BFF;"> ${otp}</h3>
      </div>
      <p>Don't share this OTP with anyone. Our customer service team will never ask you for your password, OTP, credit card, or banking info.</p>
      <p>If you did not request this verification, Please ignore this email.</p>
      <p> We hope to see you again soon.</p>

      <P style="color: #007BFF;">From Fushion Furni </p>
  </div>`;

    const data = {
      to: email,
      text: "Hey User",
      subject: "OTP Verification ",
      htm: resetURL,
    };

    await sendEmail(data);

    res.render("user/verifyEmail", {
      email,
      message: "Resent OTP successfully",
    });
  } catch (error) {
    throw new Error(error);
  }
});

const loadVerify = asyncHandler(async (req, res) => {
  try {
    res.render("user/verifyEmail");
  } catch (error) {
    // throw new Error(error)
    res.render("error");
  }
});

//Update a User

const updateaUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  // validateMongoDbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        accessStatus: req?.body?.accessStatus,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    // throw new Error(error)
    res.render("error");
  }
});
//shop

const home = asyncHandler(async (req, res) => {
  try {
    const getallProduct = await Product.find({ list: true });
    res.render("index", {
      getallProduct: getallProduct,
      message: req.flash("message"),
    });
  } catch (error) {
    // throw new Error("Home Can't Access")
    res.render("error");
  }
});
const getAllProduct = asyncHandler(async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This Page does not exists");
    }
    const product = await query;
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});
const shop = asyncHandler(async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 8;
    let search = "";
    let sortOrder = "";
    let category = "";
    let minPrice = 0;
    let maxPrice = Infinity;

    console.log(req.query); // Print the request query parameters

    // Extract filters from request query parameters
    if (req.query.Search || req.query.Sort || req.query.category) {
      search = req.query.Search;
      sortOrder = req.query.Sort;
      category = req.query.category;
      minPrice = parseFloat(req.query.MinPrice) || 0;
      maxPrice = parseFloat(req.query.MaxPrice) || Infinity;
    }

    const sortingOptions = {
      default: {},
      priceHigh: { price: -1 },
      priceLow: { price: 1 },
    };

    const filterOptions = {
      default: {
        $and: [
          search && {
            title: { $regex: new RegExp(".*" + search + ".*", "i") },
          },
          category && {
            category: category,
          },
          { price: { $gte: minPrice, $lte: maxPrice } },
          { list: true },
        ].filter(Boolean),
      },
    };

    console.log("Filter Options:", filterOptions);
    console.log("Database Query:", filterOptions.default.$and);

    const cat = await Category.find({});
    const page = parseInt(req.query.page) || 1;
    const totalProducts = await Product.countDocuments({
      $and: [filterOptions.default, { list: true }],
    });
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const usersData = await Product.find({
      $and: [filterOptions.default, { list: true }],
    })
      .sort(sortingOptions[sortOrder])
      .skip(skip)
      .limit(ITEMS_PER_PAGE);

    const listCategory = await Category.find({});

    res.render("UI/shop", {
      getallProduct: usersData,
      currentPage: page,
      totalPages: totalPages,
      search: search,
      sortOrder: sortOrder,
      cat: listCategory,
      categoryFilter: category,
      minPriceFilter: minPrice,
      maxPriceFilter: maxPrice,
    });
  } catch (error) {
    console.error("Error in shop route:", error);
    res.status(500).send("Internal Server Error");
  }
});

const about = asyncHandler(async (req, res) => {
  try {
    res.render("UI/about");
  } catch (error) {
    // throw new Error("Shop Can't Access")
    res.render("error");
  }
});
const cart = asyncHandler(async (req, res) => {
  try {
    const coupon = await Coupon.find({});
    console.log(coupon);
    res.render("UI/cart");
  } catch (error) {
    // throw new Error("Shop Can't Access")
    res.render("error");
  }
});
const services = asyncHandler(async (req, res) => {
  try {
    res.render("UI/services");
  } catch (error) {
    // throw new Error("Shop Can't Access")
    res.render("error");
  }
});
const blog = asyncHandler(async (req, res) => {
  try {
    res.render("UI/blog");
  } catch (error) {
    // throw new Error("Shop Can't Access")
    res.render("error");
  }
});
const contact = asyncHandler(async (req, res) => {
  try {
    res.render("UI/contact");
  } catch (error) {
    // throw new Error("Shop Can't Access")
    res.render("error");
  }
});
const thankyou = asyncHandler(async (req, res) => {
  try {
    res.render("UI/thankyou");
  } catch (error) {
    res.render("error");
  }
});
const product = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const getallProduct = await Product.findById({ _id: id });
    const category = await Category.find({ title: getallProduct.category });
    const offerForProduct = await OfferAssociation.find({ associationId: id })
      .populate("associationId")
      .populate("offer")
      .exec();
    const offerForCategory = await OfferAssociation.find({
      associationId: category[0]._id.toString(),
    })
      .populate("associationId")
      .populate("offer")
      .exec();
    let offer;
    if (offerForProduct.length > 0) {
      offer = offerForProduct;
    } else {
      offer = offerForCategory;
    }
    console.log(offerForCategory);
    const cart = req.session.cart || [];
    res.render("UI/productDetail", {
      getallProduct: getallProduct,
      cart: cart,
      offers: offer,
    });
  } catch (error) {
    res.render("error");
  }
});

//Get all users
const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (err) {
    // throw new Error(error)
    res.render("error");
  }
});
//Get a single Users

const getaUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (err) {
    // throw new Error(error)
    res.render("error");
  }
});

//Delete a User
const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleteaUser = await User.findByIdAndDelete({ _id: id });
    res.json({
      deleteaUser,
    });
  } catch (error) {
    // throw new Error(error)
    res.render("error");
  }
});
//handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No Refresh present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json(accessToken);
  });
});
//logout Functionality

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
      return res.sendStatus(204); //forbidden
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
    req.flash("message", " Logout Successfully ");
    res.redirect("/login");
    res.sendStatus(204); //forbidden
  } catch (error) {
    res.render("error");
  }
});

//Blocking and Unbloc

const blockUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  // validateMongoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "You are Blocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

const unBlockUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  // validateMongoDbId(id);
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "You are unBlocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});
const userCart = asyncHandler(async (req, res) => {
  const { productId, quantity, price } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const getallProduct = await Product.findById({ _id: productId });
    const category = await Category.find({ title: getallProduct.category });
    const offerForProduct = await OfferAssociation.find({
      associationId: productId,
    })
      .populate("associationId")
      .populate("offer")
      .exec();
    const offerForCategory = await OfferAssociation.find({
      associationId: category[0]._id.toString(),
    })
      .populate("associationId")
      .populate("offer")
      .exec();
    let offers = [];

    if (offerForProduct.length > 0) {
      offers = offerForProduct;
    } else  {
      offers = offerForCategory;
    }
   
      if (offers?.offer) {
        offers = offers[i].offer.percentage || 0;
      }
      else{
        offers=0
      }
    
    

    const originalPrice = getallProduct.price;
    let totalDiscountPercentage = 0;

    for (let i = 0; i < offers.length; i++) {
      totalDiscountPercentage += offers[i].offer.percentage;
    }
    const discountedPrice =
      originalPrice - originalPrice * (totalDiscountPercentage / 100);
    const roundedDiscountedPrice = Math.round(discountedPrice);
    console.log("Hello", roundedDiscountedPrice);
    const user = await User.findById(_id);
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      const existingProduct = alreadyExistCart.products.find(
        (product) => product.product.toString() === productId
      );
      if (!existingProduct) {
        alreadyExistCart.products.push({
          product: productId,
          quantity: quantity,
          price: roundedDiscountedPrice,
          offer: offers,
        });
        alreadyExistCart.cartTotal += roundedDiscountedPrice * quantity;
        await alreadyExistCart.save();
      }

      res.json(alreadyExistCart);
    } else {
      const newCart = await new Cart({
        products: [
          {
            product: productId,
            quantity: quantity,
            price: roundedDiscountedPrice,
            offer: offers,

          },
        ],
        cartTotal: roundedDiscountedPrice * quantity,
        orderby: user?._id,
      }).save();

      res.json(newCart);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
const checkout = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findOne(_id);
    const balance = await Wallet.findOne({ user: _id });
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    const isValidCart = cart.products.every((productItem) => {
      console.log(productItem.product.list);
      return (
        productItem.quantity > 0 &&
        productItem.quantity <= productItem.product.quantity &&
        productItem.product.list === true
      );
    });

    if (!isValidCart) {
      req.flash("message", "Something Went Wrong.Please Try Again !!");
      return res.redirect("/view-cart");
    }

    const addresses = await Address.find({ user: _id }).exec();
    res.render("UI/checkout", { addresses, cart, user, balance });
  } catch (error) {
    console.error(error);
    res.render("error");
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const coupon = await Coupon.find({});
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    res.render("UI/cart", {
      cart: cart,
      coupon,
      message: req.flash("message"),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
const applyCoupon = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { couponCode } = req.body;
    const cart = await Cart.findOne({ orderby: _id });
    const couponEntered = await Coupon.findOne({ couponCode: couponCode });
    const alreadyUsedCoupon = await Coupon.findOne({ usersUsed: _id });

    console.log(cart);
    console.log(couponEntered);

    if (!couponEntered) {
      // Coupon is not valid
      return res.status(400).json({ message: "Invalid coupon code" });
    }
    if (alreadyUsedCoupon && alreadyUsedCoupon._id.equals(couponEntered._id)) {
      // User has already used the same coupon
      return res
        .status(400)
        .json({ message: "You have already used this coupon" });
    }
    if (cart.totalAfterDiscount !== null) {
      // User has already applied a coupon to the cart
      return res
        .status(400)
        .json({ message: "You have already applied a coupon to the cart" });
    }

    // Apply the coupon and update the cart
    const couponUpdate = await Coupon.findByIdAndUpdate(
      couponEntered._id,
      { $push: { usersUsed: _id } },
      { new: true }
    );

    const cartUpdate = await Cart.findByIdAndUpdate(
      cart._id,
      {
        $set: { totalAfterDiscount: couponEntered.discountAmount },
        $inc: { cartTotal: -couponEntered.discountAmount },
      },
      { new: true }
    );

    // Send success response to Axios
    return res
      .status(200)
      .json({ message: "Coupon applied successfully", cart: cartUpdate });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// const applyCoupon = asyncHandler(async(req,res)=>{
//   try{
//     const {_id}=req.user
//     const { couponCode } = req.body;
//     const cart = await Cart.findOne({orderby:_id})
// const couponEntered = await Coupon.findOne({couponCode:couponCode}) ;
// console.log(cart)
// console.log(couponEntered)

// if(couponEntered){
//   const couponUpdate = await Coupon.findByIdAndUpdate(
//     couponEntered._id,
//     { $push: { usersUsed: _id } },
//     { new: true });
//     const cartUpdate = await Cart.findByIdAndUpdate(
//       cart._id,
//       {
//         $set: { totalAfterDiscount: couponEntered.discountAmount },
//         $inc: { cartTotal: -couponEntered.discountAmount }
//       },
//       { new: true }
//     );
//     }else{
//   res.json('message',"Not a valid ")
// }
//  }catch(error){
//     console.log(error)
//     throw new Error(error)
//   }
// });
const verifyRazopay = asyncHandler(async (req, res) => {
  try {
    const rawBody = req.body;
    console.log("Hello", rawBody);
    const headers = req.headers;
    console.log("Received Headers:", headers);
    const body = JSON.stringify(req.body);
    console.log("Received Body:", body);
    const signature = req.get("X-Razorpay-Signature");
    console.log("Received Signature:", signature);
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_SECRET_KEY)
      .update(body)
      .digest("hex");
    console.log(expectedSignature);

    if (signature === expectedSignature) {
      // Signature is valid, process the webhook payload
      const payload = JSON.parse(req.body);
      console.log("Webhook Event:", payload);

      // Check payment status and other details from the payload
      if (payload.event === "payment.captured") {
        // Payment was successful, you can update your order status or perform other actions
      }

      res.status(200).send("OK");
    } else {
      // Invalid signature
      console.error("Invalid Razorpay signature");
      res.status(400).send("Invalid Signature");
    }
  } catch (error) {
    console.error("Error in verifyRazopay:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const createOnlinePayment = async (req, res) => {
  try {
    const {
      email,
      product,
      mobile,
      amount: originalAmount,
      name,
      description,
      productName,
    } = req.body;

    const amount = originalAmount * 100;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "razorUser@gmail.com",
      notes: {
        username: productName,
        userEmail: email,
        productTitle: product,
      },
    };

    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        res.status(200).send({
          success: true,
          msg: "Order Created",
          order_id: order.id,
          amount: amount,
          key_id: RAZORPAY_ID_KEY,
          product_name: productName,
          description: product,
          contact: mobile,
          name: productName,
          email: email,
          razorpay_payment_id: order.id, // Add payment ID to the response
        });
      } else {
        res.status(400).send({ success: false, msg: "Something went wrong!" });
      }
    });
  } catch (error) {
    res.status(500).send({ success: false, msg: "Internal Server Error" });
  }
};
const createOrder = asyncHandler(async (req, res) => {
  try {
    const { COD, couponApplied, paymentMethod, orderTotal } = req.body;
    const { _id } = req.user;
    const { payment_id, addressId } = req.body;

    const user = await User.findOne(_id);
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    const isValidCart = cart.products.every((productItem) => {
      return (
        productItem.quantity > 0 &&
        productItem.quantity <= productItem.product.quantity &&
        productItem.product.list === true
      );
    });

    console.log(isValidCart);

    if (!isValidCart) {
      req.flash("message", "Something Went Wrong. Please Try Again!!");
      res.status(400).send({ success: false });
    } else {
      const addresses = await Address.findById({ _id: addressId });
      console.log(addresses);
      let userCart = await Cart.findOne({ orderby: user._id });
      let finalAmount = 0;

      if (couponApplied && userCart.totalAfterDiscount) {
        finalAmount = Number(userCart.totalAfterDiscount);
      } else {
        finalAmount = Number(userCart.cartTotal);
      }
      console.log(userCart.products)
      let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
          id: payment_id,
          method: paymentMethod,
          amount: Number(finalAmount),
          status: paymentMethod !== "COD" ? "Completed" : undefined, // Set 'Completed' only if paymentMethod is not 'COD'
          created: Date.now(),
        },
        orderId: orderid.generate(),
        address: addresses,
        orderby: user._id,
        orderStatus: "Processing",
        expectedDelivery: Date.now() + 7 * 24 * 60 * 60 * 1000,
      }).save();

      // Update product quantities
      for (const item of userCart.products) {
        const count = typeof item.quantity === "number" ? item.quantity : 0;
        const updatedQuantity = isNaN(count) ? 0 : +count;

        await Product.updateOne(
          { _id: item.product._id },
          { $inc: { quantity: -updatedQuantity, sold: updatedQuantity } }
        );
      }
      await Wallet.findOneAndUpdate(
        { user: _id },
        {
          $inc: { balance: -finalAmount },
          $push: {
            transactions: {
              type: "Debit",
              amount: -finalAmount, // Use parsedAmount instead of amount
              description: "Wallet Money used for Purchasing Product",
              paymentID: newOrder.orderId,
            },
          },
        },
        { new: true } // This option returns the modified document
      );

      await Cart.deleteOne({ orderby: user._id });

      res.status(200).send({ success: true });
    }
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const ITEMS_PER_PAGE = 8;
    let search = "";
    let sortOrder = "";
    if (req.query.Search || req.query.Sort) {
      search = req.query.Search;
      sortOrder = req.query.Sort;
    }
    console.log("Search:", search);
console.log("Sort Order:", sortOrder);

    const sortingOptions = {
      default: {}, 
      priceHigh: { createdAt: -1 },
      priceLow: { createdAt: 1 },
    };
    const page = parseInt(req.query.page) || 1;
    const totalProducts = await Order.countDocuments({
      $and: [
        {
          $or: [
            { orderId: { $regex: search ? ".*" + search + ".*" : "", $options: "i" } },
          ],
        },
      ],
    });
    
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const userorders = await Order.find({ orderby: _id })
      .populate("products.product")
      .populate("orderby")
      .sort(sortingOptions[sortOrder])  // Move .sort() here
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .exec();
      console.log("User Orders:", userorders);

    res.render("UI/orders", {
      userorders: userorders,
      currentPage: page,
      totalPages: totalPages,
      search: search,
      sortOrder: sortOrder
    });
  } catch (error) {
    console.error(`erroria : `, error);
    res.status(500).json({ error: "Internal server error", error });
  }
});


const getOrdersDetails = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;
  validateMongoDbId(_id);
  try {
    const userorders = await Order.findById({ _id: id })
      .populate("products.product")
      .populate("orderby")
      .populate("address")
      .exec();
    console.log(userorders);
    res.render("UI/orderDetails", { userorder: userorders });
  } catch (error) {
    throw new Error(error);
  }
});

const errorPage = asyncHandler(async (req, res) => {
  try {
    res.render("errorPage");
  } catch {
    res.sendStatus(404);
  }
});

const loadProfile = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;

    const addresses = await Address.find({ user: _id }).exec();

    const profile = await User.findById(_id);

    res.render("UI/profile", { profile, addresses });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
const loadEditProfile = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const profile = await User.findById(_id);
    res.render("UI/editProfile", { profile });
  } catch (error) {
    throw new Error(Error);
  }
});
const editProfile = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { name, phone } = req.body;
    const profile = await User.findByIdAndUpdate(
      _id,
      { $set: { name: name, mobile: phone } },
      { new: true } // This option returns the modified document instead of the original
    );
    res.redirect("/profile");
  } catch (error) {
    throw new Error(Error);
  }
});
const addAddress = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { name, mobile, street, area, landmark, pincode, addressType } =
      req.body;
    const newAddress = new Address({
      user: _id,
      name,
      mobile,
      street,
      area,
      landmark,
      pincode,
      addressType,
    });

    await newAddress.save();

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $push: { addresses: newAddress._id } },
      { new: true }
    );

    res.redirect("/checkout");
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
const editAddress = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { id } = req.params;
    const address = await Address.findById(id);
    console.log(address);
    res.render("UI/editAddress", { address });
  } catch (error) {
    throw new Error(error);
  }
});
const updateAddress = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    // Use req.body directly in the update operation
    const address = await Address.findOneAndUpdate({ _id: id }, req.body);
    console.log(address);
    res.redirect("/profile");
  } catch (error) {
    throw new Error(error);
  }
});

const addAddressOnProfile = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { name, mobile, street, area, landmark, pincode, addressType } =
      req.body;
    const newAddress = new Address({
      user: _id,
      name,
      mobile,
      street,
      area,
      landmark,
      pincode,
      addressType,
    });

    await newAddress.save();

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $push: { addresses: newAddress._id } },
      { new: true }
    );

    res.redirect("/profile");
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const removeAddress = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findByIdAndDelete({ _id: id });
    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.redirect("back");
  } catch (error) {
    throw new Error(error);
  }
});

const removeItem = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { productId } = req.body;

    const cart = await Cart.findOne({ orderby: _id });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find the product to be removed
    const removedProduct = cart.products.find((productItem) => {
      return productItem.product.toString() === productId;
    });

    if (!removedProduct) {
      return res.status(404).json({ error: "Product not found in the cart" });
    }

    cart.cartTotal -= removedProduct.price * removedProduct.quantity;

    cart.products = cart.products.filter((productItem) => {
      return productItem.product.toString() !== productId;
    });

    await cart.save();

    res.redirect("/view-cart");
  } catch (error) {
    throw new Error(error);
  }
});

const updateQuantity = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const { newQuantity } = req.body;

    const cart = await Cart.findOne({ orderby: req.user._id });
    const product = cart.products.find(
      (productItem) => productItem.product.toString() === productId
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found in the cart" });
    }

    const quantityDiff = newQuantity - product.quantity;

    product.quantity = newQuantity;

    cart.cartTotal += product.price * quantityDiff;

    await cart.save();

    res.status(200).json({
      message: "Quantity updated successfully",
      cartTotal: cart.cartTotal,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);

  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});
const loadForgetPassword = asyncHandler(async (req, res) => {
  try {
    res.render("user/forgetPassword", { message: req.flash("message") });
  } catch (error) {
    throw new Error(error);
  }
});
const loadChangePassword = asyncHandler(async (req, res) => {
  try {
    const { token } = req.params;
    res.render("user/changePassword", { token, message: req.flash("message") });
  } catch (error) {
    throw new Error(error);
  }
});
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("message", "User not found with this email");
      res.redirect("/forget-password");
    } else {
      const token = await user.createPasswordResetToken();
      await user.save();
      const resetURL = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #007BFF;">Verify Your Email</h2>
      <p>Hi, Please follow this link to reset Your Password.:</p>
      <div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin: 0; color: #007BFF;"> <a href='http://localhost:3000/reset-password/${token}'>Click Here</></h3>
      </div>
      <p>This link is valid till 10 minutes from now</p>
      <p>If you did not request this verification, Please ignore this email.</p>
      <P style="color: #007BFF;">From Fushion Furni </p>
  </div>`;
      const data = {
        to: email,
        text: "Hey User",
        subject: "Forgot Password Link",
        htm: resetURL,
      };

      await sendEmail(data);

      req.flash("message", "Password reset email sent. Check your inbox.");
      res.redirect("/forget-password");
    }
  } catch (error) {
    req.flash("message", "An error occurred. Please try again later.");
    res.redirect("/forget-password");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = await crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      req.flash("message", "Time Expired, Please try after sometimes");
    } else {
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      req.flash("message", "Your Password have been updated");
      res.redirect("/login");
    }
  } catch (error) {
    throw new Error(error);
  }
});

const loadRequestReturn = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const returns = await Order.findById(id);
    res.render("UI/requestReturn", { id });
  } catch (error) {
    throw new Error(error);
  }
});
const loadRequestCancel = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const returns = await Order.findById(id);
    res.render("UI/requestCancel", { id });
  } catch (error) {
    throw new Error(error);
  }
});
const loadWallet = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const ITEMS_PER_PAGE = 10;
    let search = "";
    let sortOrder = "";
    if (req.query.Search || req.query.Sort) {
      search = req.query.Search;
      sortOrder = req.query.Sort;
    }
    const sortingOptions = {
      default: {},
      priceHigh: { createdAt: -1 },
      priceLow: { createdAt: 1 },
    };

    const page = parseInt(req.query.page) || 1;
    const totalProducts = await Wallet.countDocuments({
      $and: [
        {
          $or: [
            { orderId: { $regex: search ? ".*" + search + ".*" : "", $options: "i" } },
          ],
        },
      ],
    });
    const totalPages = Math.ceil(1 / ITEMS_PER_PAGE);
    const skip = (page - 1) * ITEMS_PER_PAGE;

    let balance = await Wallet.findOne({ user: _id })
      .sort(sortingOptions[sortOrder]) // Move .sort() here
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .exec();
    if (!balance) {
      balance = { balance: 0 }; // Assuming 'amount' is the property representing the balance
    }

    console.log(balance); // Now log balance after initialization

    res.render("UI/wallet", {
      balance,
      currentPage: page,
      totalPages: totalPages,
      search: search,
      sortOrder: sortOrder,
    });
  } catch (error) {
    console.error("Error loading wallet:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


const loadMoney = asyncHandler(async (req, res) => {
  try {
    const { amount, paymentID } = req.body;
    const { _id } = req.user;

    let userWallet = await Wallet.findOne({ user: _id });
    if (!userWallet) {
      userWallet = new Wallet({
        user: _id,
        balance: 0,
        transactions: [],
      });
    }
    const parsedAmount = parseFloat(amount);

    userWallet.balance += parsedAmount;
    userWallet.transactions.push({
      type: "credit",
      amount: parsedAmount, // Use parsedAmount instead of amount
      description: "Added money to wallet from Razopay",
      paymentID: paymentID,
    });

    await userWallet.save();
    res.status(200).json({ success: true, wallet: userWallet });
  } catch (error) {
    console.error("Error adding money:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const requestReturn = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    
    const { selectedRequest, moreDetails, id } = req.body;
    const updateField = {
      orderStatus: 'Return Request',
      requestReson: moreDetails,  
    };

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateField },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, redirect: "/orders" });
  } catch (error) {
    console.error('Error processing return request:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const requestCancel = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    
    const { selectedRequest, moreDetails, id } = req.body;
    const updateField = {
      orderStatus: 'Cancelled',
      requestReson: moreDetails,  // Corrected typo: requestReson to requestReason
    };
    console.log(moreDetails)

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateField },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const amountToReturn = await Order.findById(id);
    if (!amountToReturn) {
      return res.status(404).json({ error: "Order not found" });
    }

    const paymentAmount = amountToReturn.paymentIntent.amount;
    const isCOD = amountToReturn.paymentIntent.status;

    console.log(isCOD);
if(isCOD==="Completed"){
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
    description: "Product Cancelled Amount has been added",
    paymentID: "cancelMoney",
  });
await userWallet.save();
}   
    res.json({ success: true, redirect: "/orders" });
  } catch (error) {
    console.error('Error processing return request:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const loadWishlist = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const wishList = await WishList.findOne({ orderby: _id }).populate(
      "products.product"
    );
    res.render("UI/wishlist", { wishList });
  } catch (error) {
    console.error(error);
    res.status(500).render("UI/error", { error: "Internal Server Error" });
  }
});

const createWishlist = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id);
    const alreadyExists = await WishList.findOne({ orderby: user._id });
    const { productId } = req.body;
    if (alreadyExists) {
      const existingProduct = alreadyExists.products.find(
        (product) => product.product.toString() === productId
      );

      if (!existingProduct) {
        alreadyExists.products.push({
          product: productId,
        });
        await alreadyExists.save();
      }

      res.json(alreadyExists);
    } else {
      const newWishlist = await new WishList({
        products: [
          {
            product: productId,
          },
        ],
        orderby: user._id,
      }).save();

      res.json(newWishlist);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
const removeWish = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { wishlist } = req.body;
    const wishlists = await WishList.findOne({ orderby: _id });
    if (!wishlists) {
      return res.status(404).json({ error: "Wishlist not found" });
    }

    const removedProduct = wishlists.products.find((productItem) => {
      return productItem.product.toString() === wishlist;
    });

    if (!removedProduct) {
      return res
        .status(404)
        .json({ error: "Product not found in the wishlist" });
    }

    wishlists.products = wishlists.products.filter((productItem) => {
      return productItem.product.toString() !== wishlist;
    });
    await wishlists.save();
    res.redirect("/wishlist");
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  errorPage,
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  updateaUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logout,
  loadlogin,
  shop,
  contact,
  blog,
  services,
  checkout,
  cart,
  about,
  home,
  product,
  loadVerify,
  userCart,
  getUserCart,
  createOrder,
  thankyou,
  getOrders,
  loadProfile,
  addAddress,
  removeItem,
  resetPassword,
  forgotPasswordToken,
  updatePassword,
  loadForgetPassword,
  loadChangePassword,
  loadVerifyEmail,
  verifyMail,
  resendMail,
  updateQuantity,
  getOrdersDetails,
  createOnlinePayment,
  requestReturn,
  requestCancel,
  loadRequestReturn,
  removeAddress,
  loadEditProfile,
  editProfile,
  addAddressOnProfile,
  loadWishlist,
  createWishlist,
  removeWish,
  editAddress,
  updateAddress,
  verifyRazopay,
  loadWallet,
  loadMoney,
  applyCoupon,
  userRegister,
  loadRequestCancel,
  generatePdf
};

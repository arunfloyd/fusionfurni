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
const Otp = require("../models/otpModel");
const bcrypt = require("bcrypt");
const Order = require("../models/orderModel");
const Address = require("../models/addressModel");
const uniqid = require("uniqid");
const sendEmail = require("./emailController");
const crypto = require("crypto");
const otpGenerator = require("otp-generator");
const orderid = require('order-id')('key');
const loadlogin = asyncHandler(async (req, res) => {
  try {
    if (req.cookies.refreshToken) {
      res.redirect("/user/home");
    } else {
      res.render("user/loginAndSignUp", { message: req.flash("message") });
    }
  } catch (error) {
    // throw new Error("Can't Load Admin ")
    res.send(error);
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
      // Pass an error message to the template
      req.flash("message", "Invalid Credentials");
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/user/login", { message: "An error occurred" });
  }
});

const createUser = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email;
    const mobile = req.body.mobile;
    const mob = await User.findOne({ mobile: mobile });
    const findUser = await User.findOne({ email: email });
    console.log(findUser);
    if (!findUser && !mob) {
      const newUser = await User.create(req.body);
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
      const resetURL = `To authenticate, please use the following One Time Password (OTP):
      ${otp}
      Don't share this OTP with anyone. Our customer service team will never ask you for your password, OTP, credit card, or banking info.
      We hope to see you again soon.`;
      const data = {
        to: email,
        text: "Hey User",
        subject: "OTP Verification ",
        htm: resetURL,
      };
      await sendEmail(data);
      // res.redirect('/verify-mail');
      res.redirect(`/verify-mail?email=${encodeURIComponent(email)}`);
    } else {
      req.flash("message", "User Already Exists");
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    res.render("user/errorLoginAndSignUp", { message: "An error occurred" });
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
    const user = await User.findOne({
      email: email,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (user) {
      const enteredOTP = req.body.otp;
      const storedOtp = await Otp.findOne({ user: user._id });

      if (storedOtp) {
        const isMatch = await bcrypt.compare(enteredOTP, storedOtp.otp);

        if (isMatch) {
          req.flash("message", "User Successfully Verified");
          res.redirect("/login");
        } else {
          req.flash("message", "Entered OTP is Wrong");
          res.redirect(`/verify-mail?email=${encodeURIComponent(email)}`);
        }
      } else {
        req.flash("message", "Time Expired, Please try after sometimes");
        res.redirect(`/verify-mail?email=${encodeURIComponent(email)}`);
      }
    } else {
      req.flash("message", "User not found");
      res.redirect("/verify-mail");
    }
  } catch (error) {
    console.error(error);
    req.flash("message", "An error occurred during OTP verification");
    res.redirect("/verify-mail");
  }
});
const resendMail = asyncHandler(async (req, res) => {
  console.log("Resend mail route triggered");
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    // Generate a new OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const salt = await bcrypt.genSalt(10);
    const encryptedOtp = await bcrypt.hash(otp, salt);

    // Update the existing OTP in the database
    // Assuming the Otp model has a field 'email' to match the user
    await Otp.findOneAndUpdate(
      { user: user._id },
      { otp: encryptedOtp, expiresAt: new Date(Date.now() + 1 * 60 * 1000) }
    );

    const resetURL = `To authenticate, please use the following One Time Password (OTP):
      ${otp}
      Don't share this OTP with anyone. Our customer service team will never ask you for your password, OTP, credit card, or banking info.
      We hope to see you again soon.`;

    const data = {
      to: email,
      text: "Hey User",
      subject: "OTP Verification ",
      htm: resetURL,
    };

    // Send the email with the new OTP
    await sendEmail(data);

    // Render the same page with a success message
    res.render("user/verifyEmail", {
      email,
      message: "Resent OTP successfully",
    });
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
});


const loadVerify = asyncHandler(async (req, res) => {
  try {
    res.render("user/verifyEmail");
  } catch (error) {
    // throw new Error(error)
    res.send(error);
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
    res.send(error);
    res.render("error");
  }
});
//shop

const home = asyncHandler(async (req, res) => {
  try {
    const getallProduct = await Product.find({ list: true });
    res.render("index", { getallProduct: getallProduct });
  } catch (error) {
    // throw new Error("Home Can't Access")
    res.send(error);
    res.render("error");
  }
});

const shop = asyncHandler(async (req, res) => {
  try {
    const getallProduct = await Product.find({ list: true });
    res.render("UI/shop", { getallProduct: getallProduct });
  } catch (error) {
    // throw new Error("Shop Can't Access")
    res.send(error);
    res.render("error");
  }
});
const about = asyncHandler(async (req, res) => {
  try {
    res.render("UI/about");
  } catch (error) {
    // throw new Error("Shop Can't Access")
    res.send(error);
    res.render("error");
  }
});
const cart = asyncHandler(async (req, res) => {
  try {
    res.render("UI/cart");
  } catch (error) {
    // throw new Error("Shop Can't Access")
    res.send(error);
    res.render("error");
  }
});
const services = asyncHandler(async (req, res) => {
  try {
    res.render("UI/services");
  } catch (error) {
    // throw new Error("Shop Can't Access")
    res.send(error);
    res.render("error");
  }
});
const blog = asyncHandler(async (req, res) => {
  try {
    res.render("UI/blog");
  } catch (error) {
    // throw new Error("Shop Can't Access")
    res.send(error);
    res.render("error");
  }
});
const contact = asyncHandler(async (req, res) => {
  try {
    res.render("UI/contact");
  } catch (error) {
    // throw new Error("Shop Can't Access")
    res.send(error);
    res.render("error");
  }
});
const thankyou = asyncHandler(async (req, res) => {
  try {
    res.render("UI/thankyou");
  } catch (error) {
    // throw new Error("Shop Can't Access")
    res.send(error);
    res.render("error");
  }
});
const product = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const getallProduct = await Product.findById({ _id: id });
    const cart = req.session.cart || [];
    res.render("UI/productDetail", {
      getallProduct: getallProduct,
      cart: cart,
    });
  } catch (error) {
    // throw new Error("Shop Can't Access")
    res.send(error);
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
    res.send(error);
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
    res.send(error);
    res.render("error");
  }
});

//Delete a User
const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const deleteaUser = await User.findByIdAndDelete({ _id: id });
    res.json({
      deleteaUser,
    });
  } catch (error) {
    // throw new Error(error)
    res.send(error);
    res.render("error");
  }
});
//handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  console.log(refreshToken);
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
    res.send(error);
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
    const user = await User.findById(_id);
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });

    if (alreadyExistCart) {
      // Check if the product already exists in the cart
      const existingProduct = alreadyExistCart.products.find(
        (product) => product.product.toString() === productId
      );

      if (!existingProduct) {
        // Add the product to the cart if it doesn't exist
        alreadyExistCart.products.push({
          product: productId,
          quantity: quantity,
          price: price,
        });

        alreadyExistCart.cartTotal += price * quantity;
        await alreadyExistCart.save();
      }

      res.json(alreadyExistCart);
    } else {
      // Create a new cart
      const newCart = await new Cart({
        products: [
          {
            product: productId,
            quantity: quantity,
            price: price,
          },
        ],
        cartTotal: price * quantity,
        orderby: user?._id,
      }).save();

      res.json(newCart);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// const userCart = asyncHandler(async (req, res) => {
//   const { productId, quantity, price } = req.body;
//   const { _id } = req.user;
//   validateMongoDbId(_id);

//   try {
//     let products = [];
//     const user = await User.findById(_id);
//     const alreadyExistCart = await Cart.findOne({ orderby: user._id });
//     let updatedCart;

//     if (alreadyExistCart) {
//       // Update existing cart
//       alreadyExistCart.products.push({
//         product: productId,
//         quantity: quantity,
//         price: price,
//       });

//       alreadyExistCart.cartTotal += price * quantity;

//       updatedCart = await alreadyExistCart.save();
//     } else {
//       // Create a new cart
//       let newCart = await new Cart({
//         products: [
//           {
//             product: productId,
//             quantity: quantity,
//             price: price,
//           },
//         ],
//         cartTotal: price * quantity,
//         orderby: user?._id,
//       }).save();

//       updatedCart = newCart;
//     }

//     res.json(updatedCart);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });


const checkout = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    const addresses = await Address.find({ user: _id }).exec();
    res.render("UI/checkout", { addresses, cart });
  } catch (error) {
    // throw new Error("Shop Can't Access")
    res.send(error);
    res.render("error");
  }
});
const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  
  // validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    

    //  console.log(id)
    res.render("UI/cart", { cart: cart });
  } catch (error) {
    console.error(error); // Log the error for further investigation
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied, addressId, paymentMethod } = req.body;
  const { _id } = req.user;

  try {
    const user = await User.findById(_id);
    const addresses = await Address.find({ user: _id }).exec();
    let userCart = await Cart.findOne({ orderby: user._id });
    let finalAmount = 0;

    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount;
    } else {
      finalAmount = userCart.cartTotal;
    }

    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: paymentMethod,
        amount: finalAmount,
        status: "Pending",
        created: Date.now(),
      },
      OrderId:orderid.generate(),
      address: addressId,
      orderby: user._id,
      orderStatus: "Processing",
      expectedDelivery: Date.now() + 5 * 24 * 60 * 60 * 1000
    }).save();

    // Update product quantities
    let update = userCart.products.map((item) => {
      const count = typeof item.count === "number" ? item.count : 0;
      const updatedQuantity = isNaN(count) ? 0 : +count;

      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: {
            $inc: { quantity: -updatedQuantity, sold: updatedQuantity },
          },
        },
      };
    });

    const updated = await Product.bulkWrite(update, {});
    

    res.redirect("/thankyou");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userorders = await Order.find({ orderby: _id })
      .populate("products.product")
      .populate("orderby")
      .exec();

    res.render("UI/orders", { userorders: userorders });
  } catch (error) {
    throw new Error(error);
  }
});
const getOrdersDetails = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;
  validateMongoDbId(_id);
  try {
    const userorders = await Order.findById({ _id:id })
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

    // Query all addresses associated with the user
    const addresses = await Address.find({ user: _id }).exec();
    console.log(addresses);
    // Query the user's profile
    const profile = await User.findById(_id);

    res.render("UI/profile", { profile, addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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
    console.log("New Address:", newAddress);

    await newAddress.save();
    console.log("Address Saved");

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $push: { addresses: newAddress._id } },
      { new: true }
    );
    console.log("User Updated:", updatedUser);

    res.redirect("/checkout");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// const removeItem = asyncHandler(async (req, res) => {
//   try {
//     const { _id } = req.user;
//     const { productId } = req.body; 

//     const cart = await Cart.findOne({ orderby: _id });
//     const quantity = cart.products.quantity

//     if (!cart) {
//       return res.status(404).json({ error: "Cart not found" });
//     }

//     // Find the product to be removed
//     const removedProduct = cart.products.find((productItem) => {
//       return productItem.product.toString() === productId;
//     });

//     if (!removedProduct) {
//       return res.status(404).json({ error: "Product not found in the cart" });
//     }

//     // Decrease the cartTotal by the price of the removed product
//     cart.cartTotal -= removedProduct.price*quantity;

//     // Remove the product from the products array
//     cart.products = cart.products.filter((productItem) => {
//       return productItem.product.toString() !== productId;
//     });

//     // Update the cart with the modified data
//     await cart.save();

//     res.redirect("/view-cart");
//   } catch (error) {
//     throw new Error(error);
//   }
// });
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

    // Decrease the cartTotal by the total price of the removed product(s)
    cart.cartTotal -= removedProduct.price * removedProduct.quantity;

    // Remove the product from the products array
    cart.products = cart.products.filter((productItem) => {
      return productItem.product.toString() !== productId;
    });

    // Update the cart with the modified data
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

    // Find the cart and the product in the cart
    const cart = await Cart.findOne({ orderby: req.user._id });
    const product = cart.products.find(productItem => productItem.product.toString() === productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found in the cart" });
    }

    // Calculate the difference in quantity
    const quantityDiff = newQuantity - product.quantity;

    // Update the product quantity
    product.quantity = newQuantity;

    // Update the cart total
    cart.cartTotal += product.price * quantityDiff;

    // Save the changes to the cart
    await cart.save();

    res.status(200).json({ message: 'Quantity updated successfully', cartTotal: cart.cartTotal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Add the route to your Express application

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
  console.log(email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("message", "User not found with this email");
      res.redirect("/forget-password");
    } else {
      const token = await user.createPasswordResetToken();
      await user.save();
      const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:3002/reset-password/${token}'>Click Here</>`;
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
    console.error("Error in forgotPasswordToken:", error);
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

module.exports = resetPassword;

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
  getOrdersDetails
};

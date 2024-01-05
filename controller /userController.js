//userCreating Section
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
const Order = require("../models/orderModel");
const Address = require("../models/addressModel");


const uniqid = require("uniqid");
var otp;

// const loadlogin = async(req, res) => {
//     try {
//         if(!req.cookies.refreshToken){
//             res.render('user/loginAndSignUp',{ message: req.flash('message')})

//             else{
//             res.redirect('/user/home')}

//             }
//     } catch (error) {
//         console.log(error.message)
//     }
// }
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
// const createUser = asyncHandler(async (req, res) => {
//     try {
//         const email = req.body.email;
//         const mobile = req.body.mobile;
//         console.log(mobile);
//         const mob = await User.findOne({ mobile: mobile });
//         const findUser = await User.findOne({ email: email });
//         console.log(findUser);
//         if (!findUser && !mob) {
//             const findUser = await User.create(req.body);
//             console.log(`User created with _id: ${newUser._id}`);
//             res.render('user/requestVerify', { userId: findUser });
//         } else {
//             req.flash('message', 'User Already Exists');
//             res.redirect('/user/login');
//         }
//     } catch (error) {
//         console.error(error);
//         res.render('user/errorLoginAndSignUp', { message: 'An error occurred' });
//     }
// });
// const createUser = asyncHandler(async (req,res)=>{
//     try {
//     const email = req.body.email
//     const mobile = req.body.mobile
//     console.log(mobile)
//     const mob = await User.findOne({mobile:mobile})
//     const findUser= await User.findOne({email:email});
//     console.log(findUser);
//     let userId;
//     if(!findUser&& !mob){

//         const newUser = await User.create(req.body);
//         console.log(`User created with _id: ${userId}`);
//         const id = newUser._id;
//         const findUser= await User.findById({_id: id});
//       res.render('user/requestVerify',{userId:findUser})
//     }else{
//         req.flash('message', 'User Already Exists');
//         res.redirect('/user/login');

//     }
// } catch (error) {
//     console.error(error);
//     res.render('user/errorLoginAndSignUp', { message: 'An error occurred' });
// }
//  });
const createUser = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email;
    const mobile = req.body.mobile;
    const mob = await User.findOne({ mobile: mobile });
    const findUser = await User.findOne({ email: email });
    console.log(findUser);
    let userId;
    if (!findUser && !mob) {
      const newUser = await User.create(req.body);
      console.log(`User created with _id: ${newUser._id}`);
      // const id = newUser._id; // This line is not needed
      // const findUser = await User.findById({ _id: id }); // This line is not needed
      res.render("user/requestVerify", { userId: newUser });
      // res.json(newUser); // Remove this line
    } else {
      req.flash("message", "User Already Exists");
      res.redirect("/user/login");
    }
  } catch (error) {
    console.error(error);
    res.render("user/errorLoginAndSignUp", { message: "An error occurred" });
  }
});

console.log(otp);
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
// const home = asyncHandler(async (req, res) => {
//     try {
//       let user = null;

//       // Check if refreshToken cookie is present
//       if (req.cookies.refreshToken) {
//         const token = req.cookies.refreshToken;

//         // Verify the refresh token and get user information
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const userId = decoded.id;

//         // Retrieve user details from the database
//         user = await User.findById(userId);
//       }

//       const getallProduct = await Product.find();

//       res.render('index', { getallProduct, user });
//     } catch (error) {
//       throw new Error("Shop Can't Access");
//     }
//   });

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
const checkout = asyncHandler(async (req, res) => {
  try {
    const {_id} = req.user;
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    const addresses = await Address.find({ user: _id }).exec();
    res.render("UI/checkout",{addresses,cart});
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

// login for User
// const loginUserCtrl = asyncHandler(async(req,res)=>{
//             const email = req.body.email
//             const password = req.body.password
//             // const{email,password}=req.body;

//             //check if user exists or not
//             const findUser = await User.findOne({email});
//             if(findUser && await findUser.isPasswordMatched(password) && findUser.isBlocked==false){
//                 const refreshToken = await generateRefreshToken(findUser?._id);
//                 const updateuser = await User.findByIdAndUpdate(
//                     findUser.id,{
//                         refreshToken:refreshToken,
//                     },{
//                         new:true
//                     }
//                 );
//                 res.cookie('refreshToken',refreshToken,{
//                     httpOnly:true,
//                     maxAge:72*60*60*1000
//                 })
//         res.redirect('/user/home')

//             }else{
//                 res.render('user/loginAndSignUp', { errorMessage: 'Invalid credentials' })
//             }
//             console.log(email)
//         });

// // login for Admin
// const loginAdmin = asyncHandler(async (req,res)=>{
//     try{
// res.render('adminLogin')
//     }catch(error){
//         throw new Error("Can't Load Admin ")
//     }
// })
// const loginAdminCtrl = asyncHandler(async(req,res)=>{
//     // const email = req.body.email
//     // const password = req.body.password
//     const{email,password}=req.body;
//     //check if user exists or not
//     const adminUser = await User.findOne({email});
//     if(adminUser && await adminUser.isPasswordMatched(password ) && (adminUser.role =="admin")){
//         const refreshToken = await generateRefreshToken(adminUser?._id);
//         const updateuser = await User.findByIdAndUpdate(
//             adminUser.id,{
//                 refreshToken:refreshToken,
//             },{
//                 new:true
//             }
//         );
//         res.cookie('refreshToken',refreshToken,{
//             httpOnly:true,
//             maxAge:72*60*60*1000
//         })
// res.json({
//     _id:adminUser?._id,
//     name:adminUser?.name,
//     email:adminUser.email,
//     mobile:adminUser?.mobile,
//     tokens:generateToken(adminUser?._id),
// })

//     }else{
//         throw new Error("Invalid Credentials")
//     }
//     console.log(email)
// });

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
//Get a single Users
// const getaUser =asyncHandler(async(req,res)=>{

//     const { id } =req.params;
//     // validateMongoDbId(id);
//     try{
//         const getaUser = await User.findById(id);
//         res.json({
//             getaUser
//         })
//     }catch(error){
//         throw new Error(error)
//     }

// })
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
    res.redirect("/user/login");
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
// const userCart = asyncHandler(async (req, res) => {
//     const cookie = req.cookies;
//     if(!cookie?.refreshToken) throw new Error ("No Refresh Token in Cookies");
//     const refreshToken = cookie.refreshToken;
//     const user = await User.findOne({refreshToken});
//     const { cart } = req.body;
//     const { _id } = user.id;
//     // validateMongoDbId(_id);
//     try {
//       let products = [];
//       const user = await User.findById(_id);
//       // check if user already have product in cart
//       const alreadyExistCart = await Cart.findOne({ orderby: user._id });
//       if (alreadyExistCart) {
//         alreadyExistCart.remove();
//       }
//       for (let i = 0; i < cart.length; i++) {
//         let object = {};
//         object.product = cart[i]._id;
//         object.count = cart[i].count;
//         object.color = cart[i].color;
//         let getPrice = await Product.findById(cart[i]._id).select("price").exec();
//         object.price = getPrice.price;
//         products.push(object);
//       }
//       let cartTotal = 0;
//       for (let i = 0; i < products.length; i++) {
//         cartTotal = cartTotal + products[i].price * products[i].count;
//       }
//       let newCart = await new Cart({
//         products,
//         cartTotal,
//         orderby: user?._id,
//       }).save();
//       res.json(newCart);
//     } catch (error) {
//       throw new Error(error);
//     }
//   });
const userCart = asyncHandler(async (req, res) => {
  const { productId, quantity, price } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    let products = [];
    const user = await User.findById(_id);
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    let updatedCart;

    if (alreadyExistCart) {
      // Update existing cart
      alreadyExistCart.products.push({
        product: productId,
        quantity: quantity,
        price: price,
      });

      alreadyExistCart.cartTotal += price * quantity;

      updatedCart = await alreadyExistCart.save();
    } else {
      // Create a new cart
      let newCart = await new Cart({
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

      updatedCart = newCart;
    }

    res.json(updatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// const userCart = asyncHandler(async (req, res) => {
//     const { productId } = req.body;
//     const { _id } = req.user;
//     console.log(req.body);

//     validateMongoDbId(_id);

//     try {
//       if (!Array.isArray(productId)) {
//         res.status(400).json({ error: 'Invalid request: productDetails must be an array' });
//         return;
//       }

//       let products = [];
//       const user = await User.findById(_id);

//       let alreadyExistCart = await Cart.findOne({ orderby: user._id });

//       let newCart;

//       if (!alreadyExistCart) {
//         newCart = await new Cart({
//           products: [],
//           cartTotal: 0,
//           orderby: user?._id,
//         }).save();
//       } else {
//         alreadyExistCart.remove(); // Remove existing cart if needed
//       }

//       for (const product of productId) {
//         const object = {
//           product: product.productId,
//           quantity: product.quantity,
//           price: product.price
//         };
//         products.push(object);
//       }

//       let cartTotal = 0;
//       for (let i = 0; i < products.length; i++) {
//         cartTotal = cartTotal + products[i].price * products[i].quantity;
//       }

//       newCart.products = products;
//       newCart.cartTotal = cartTotal;
//       await newCart.save();

//       res.json(newCart);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  console.log(_id);
  // validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    console.log(cart);

    //  console.log(id)
    res.render("UI/cart", { cart: cart });
  } catch (error) {
    console.error(error); // Log the error for further investigation
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  //   console.log(COD)
  const { _id } = req.user;
  //   validateMongoDbId(_id);
  try {
    const user = await User.findById(_id);
    console.log(user);
    let userCart = await Cart.findOne({ orderby: user._id });
    console.log(userCart);
    let finalAmout = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmout = userCart.totalAfterDiscount;
    } else {
      finalAmout = userCart.cartTotal;
    }
    console.log(finalAmout);
    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmout,
        status: "Cash on Delivery",
        created: Date.now(),
        currency: "usd",
      },
      orderby: user._id,
      orderStatus: "Cash on Delivery",
    }).save();
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
    res.json({ message: "success" });
  } catch (error) {
    throw new Error(error);
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
  
    console.log(userorders);
    res.render("UI/orders", { userorders: userorders });
  } catch (error) {
    throw new Error(error);
  }
});
// const userCart = asyncHandler(async (req, res) => {
//     const { cart } = req.body;
//     const { productId, quantity } = req.body;
//     console.log(productId);
//     console.log(quantity);

//     const { _id } = req.user;
//     validateMongoDbId(_id);
//     try {
//       let products = [];
//       const user = await User.findById(_id);
//       console.log(user)
//       // check if user already have product in cart
//       const alreadyExistCart = await Cart.findOne({ orderby: user._id });
//       console.log(1)

//       if (alreadyExistCart) {
//         alreadyExistCart.remove();
//       }
//       console.log(2)

//       for (let i = 0; i < cart.length; i++) {
//         let object = {};
//         object.product = cart[i].productId;
//         object.count = cart[i].quantity;
//         let getPrice = await Product.findById(cart[i].productId).select("price").exec();
//         object.price = getPrice.price;
//         products.push(object);
//       }
//       console.log(3)

//       let cartTotal = 0;
//       for (let i = 0; i < products.length; i++) {
//         cartTotal = cartTotal + products[i].price * products[i].count;
//       }
//       let newCart = await new Cart({
//         products,
//         cartTotal,
//         orderby: user?._id,
//       }).save();
//       console.log(2)

//       res.json(newCart);
//     } catch (error) {
//       throw new Error(error);
//     }
//   });
// const userCart = asyncHandler(async (req, res) => {
//     const cookie = req.cookies;
//     if (!cookie?.refreshToken) {
//       throw new Error("No Refresh Token in Cookies");
//     }

//     const token = cookie.refreshToken;

//     try {
//       // Find user by refreshToken
//       const user = await User.findOne({ refreshToken });
//   console.log(1);
//       if (!user) {
//         return res.status(400).json({ error: 'User not found' });
//       }
//       console.log(2);

//       const { cart } = req.body;
//       const { _id } = user;

//       let products = [];
//       // Check if user already has a cart
//       const alreadyExistCart = await Cart.findOne({ orderby: user._id });

//       // If a cart already exists, remove it
//       if (alreadyExistCart) {
//         await alreadyExistCart.remove();
//       }
//       console.log(3);

//       for (let i = 0; i < cart.length; i++) {
//         let object = {};
//         object.product = cart[i]._id;
//         object.count = cart[i].count;
//         object.color = cart[i].color;

//         // Use lean() to convert the result to a plain JavaScript object
//         let getPrice = await Product.findById(cart[i]._id).select('price').lean().exec();
//         object.price = getPrice.price;
//         products.push(object);
//       }
//       console.log(4);

//       let cartTotal = 0;
//       for (let i = 0; i < products.length; i++) {
//         cartTotal = cartTotal + products[i].price * products[i].count;
//       }

//       let newCart = await new Cart({
//         products,
//         cartTotal,
//         orderby: user._id,
//       }).save();

//       res.json(newCart);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });

var email;

// // var otp = Math.random();
// // otp = otp * 1000000;
// // otp = parseInt(otp);
// // Generate OTP function
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
}

// // Initial OTP generation
otp = generateOTP();
console.log(otp);
// // Set interval to generate a new OTP every 5 minutes (adjust the interval as needed)
var otpInterval = setInterval(function () {
  otp = generateOTP();
  console.log("New OTP:", otp);
}, 5 * 60 * 1000); // 5 minutes in milliseconds

// // Example: Stop the interval after 15 minutes (adjust the duration as needed)
// console.log(otp);

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "Gmail",

  auth: {
    user: "arunvinod9497@gmail.com",
    pass: "kttq myla zmfc ldnl",
  },
});
const sendMail = asyncHandler(async (req, res) => {
  try {
    email = req.body.email;
    // send mail with defined transport object
    var mailOptions = {
      to: req.body.email,
      subject: "Otp for registration is: ",
      html:
        "<h3>OTP for account verification is </h3>" +
        "<h1 style='font-weight:bold;'>" +
        otp +
        "</h1>", // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      req.flash("message", "Sucessfully Sent to Your Mail id");
      res.render("user/verifyEmail", { email, message: req.flash("message") });
    });
  } catch (error) {
    res.send(error);
    res.render("error");
  }
});

const verifyMail = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email;

    if (req.body.otp == otp) {
      const adminUser = await User.findOne({ email: email });

      const updateuser = await User.findByIdAndUpdate(
        adminUser.id,
        { isBlocked: false },
        { new: true }
      );

      req.flash("message", "Successfully Verified");
      res.redirect("/user/login");
    } else {
      req.flash("message", "Sorry the OTP is invalid");
      res.render("user/verifyEmail", { email, message: req.flash("message") });
      res.render("user/verifyEmail", { message: req.flash("message") });
      // res.render('user/verifyEmail')
      console.log("3");
    }
  } catch (error) {
    console.log("4");
    console.log(error);
    throw new Error(error);
  }
});

const resendMsail = asyncHandler(async (req, res) => {
  var mailOptions = {
    to: email,
    subject: "Otp for registration is: ",
    html:
      "<h3>OTP for account verification is </h3>" +
      "<h1 style='font-weight:bold;'>" +
      otp +
      "</h1>", // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    res.render("otp", { msg: "otp has been sent" });
  });
});

const errorPage = asyncHandler(async (req, res) => {
  try {
    res.render("errorPage");
  } catch {
    res.sendStatus(404);
  }
});
const resendMail = asyncHandler(async (req, res) => {
  console.log("HElllooo");
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
    const { name,mobile,street, area, landmark, pincode, addressType } = req.body;
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
    console.log('New Address:', newAddress);

    await newAddress.save();
    console.log('Address Saved');

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $push: { addresses: newAddress._id } },
      { new: true }
    );
    console.log('User Updated:', updatedUser);

    res.render('UI/profile', { profile: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// const removeItem = asyncHandler(async(req,res)=>{
//   try{
//     const {_id}= req.user;
//     const order = await Cart.findByIdAndDelete({ orderby: _id }).exec();
//     res.redirect('/view-cart')
//   }catch(error){
//     throw new Error(error)
// }});

const removeItem = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const { productId } = req.body; // Assuming you're sending productId in the request body

    // Find the cart for the user
    const cart = await Cart.findOne({ orderby: _id });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Find the product to be removed
    const removedProduct = cart.products.find(productItem => {
      return productItem.product.toString() === productId;
    });

    if (!removedProduct) {
      return res.status(404).json({ error: 'Product not found in the cart' });
    }

    // Decrease the cartTotal by the price of the removed product
    cart.cartTotal -= removedProduct.price;

    // Remove the product from the products array
    cart.products = cart.products.filter(productItem => {
      return productItem.product.toString() !== productId;
    });

    // Update the cart with the modified data
    await cart.save();

    res.redirect('/view-cart');
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
  sendMail,
  resendMail,
  verifyMail,
  userCart,
  getUserCart,
  createOrder,
  thankyou,
  getOrders,
  loadProfile,
  addAddress,
  removeItem
};

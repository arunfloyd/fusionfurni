const express = require("express");
const {
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  isAdmin,
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
  sendMail,
  resendMail,
  verifyMail,
  errorPage,
  userCart,
  getUserCart,
  createOrder,
  thankyou,
  getOrders,
} = require("../controller /userController");
const { authMiddleware,userMiddleware } = require("../middlewares/authMiddleware");
const config = require("../config/config");
const router = express.Router();
const multer = require("multer");
const storage = config.configureMulter();

// router.get('/login', (req, res, next) => {
//     res.set('Cache-Control', 'no-store, no-cache');
//     next();
//   }, loginUserCtrl);
router.get(
  "/login",
  (req, res, next) => {
    try {
      res.set("Cache-Control", "no-store, no-cache");
      next();
    } catch (error) {
      console.log("Error in cache control middleware:", error);
      throw new Error("Can't set cache control headers");
    }
  },
  loadlogin
);

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.get("/shop", shop);
router.get("/home", home);
router.get("/contact", contact);
router.get("/product/:id", product);
router.get("/blog", blog);
router.post("/cart",userMiddleware,userCart);
router.get("/view-cart",userMiddleware,getUserCart);
router.get("/checkout", checkout);
router.get("/orders", getOrders);
router.get("/create-order",userMiddleware,createOrder);
router.get("/thankyou",userMiddleware,thankyou);
router.get("/services", services);
router.get("/cart",cart);
router.get("/about", about);
router.get("/login", loadlogin);
router.get("/all-user", getallUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.post("/send", sendMail);
router.post("/verification", verifyMail);
router.post("/resendMail", resendMail);
router.get("/error", errorPage);

// var email;

// // var otp = Math.random();
// // otp = otp * 1000000;
// // otp = parseInt(otp);
// // Generate OTP function
// function generateOTP() {
//     return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
// }

// // Initial OTP generation
// var otp = generateOTP();
// // Set interval to generate a new OTP every 5 minutes (adjust the interval as needed)
// var otpInterval = setInterval(function () {
//     otp = generateOTP();
//     console.log('New OTP:', otp);
// }, 5 * 60 * 1000); // 5 minutes in milliseconds

// // Example: Stop the interval after 15 minutes (adjust the duration as needed)
// console.log(otp);

// let transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     service: 'Gmail',

//     auth: {
//         user: 'arunvinod9497@gmail.com',
//         pass: 'kttq myla zmfc ldnl',
//     }

// });

// router.post('/send',function (req, res) {
//     email = req.body.email;
//     // send mail with defined transport object
//     var mailOptions = {
//         to: req.body.email,
//         subject: "Otp for registration is: ",
//         html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body

//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             return console.log(error);
//         }
//         console.log('Message sent: %s', info.messageId);
//         console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

//         res.render('user/verifyEmail',{email:email});
//     });
// });

// router.post('/verify', async function (req, res) {
//     email = req.body.email;

//     if (req.body.otp == otp) {
//         const adminUser = await User.findOne({email});
//         const updateuser = await User.findByIdAndUpdate(adminUser.id, { isBlocked: false }, { new: true });
//         // res.render('user/loginAndSignUp')
//         res.redirect('/user/login')
//     }
//     else {
//         res.render('user/verifyEmail', { msg: 'otp is incorrect' });
//     }
// });

// router.post('/resend', function (req, res) {
//     var mailOptions = {
//         to: email,
//         subject: "Otp for registration is: ",
//         html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             return console.log(error);
//         }
//         console.log('Message sent: %s', info.messageId);
//         console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//         res.render('otp', { msg: "otp has been sent" });
//     });

// });

module.exports = router;

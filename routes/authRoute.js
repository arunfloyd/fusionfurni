const express = require("express");
const {
  createUser,
  loginUserCtrl,
  getallUser,
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
  loadProfile,
  addAddress,
  removeItem,
  forgotPasswordToken,
  resetPassword,
  loadForgetPassword,
  loadChangePassword,
  loadVerifyEmail,
  updateQuantity,
  getOrdersDetails,
  createOnlinePayment,
  shopFilter
} = require("../controller /userController");
const {
  userMiddleware,
  noCacheHeaders,
  isBlocked
} = require("../middlewares/authMiddleware");
const router = express.Router();
router.get("/login", noCacheHeaders, loadlogin);
router.post("/login", loginUserCtrl);
router.get("/register", loginUserCtrl);
router.post("/register", createUser);
router.get("/forget-password", loadForgetPassword);
router.post("/forget-password", forgotPasswordToken);
router.get("/reset-password/:token", loadChangePassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-mail", loadVerifyEmail);
router.post("/verify-mail", verifyMail);
router.post("/resend-mail", resendMail);
router.get("/shop", shop);
router.get("/home", home);
router.get("/contact", contact);
router.get("/product/:id", product);
router.get("/blog", blog);
router.get("/services", services);
router.get("/cart", cart);
router.get("/about", about);
router.post("/cart", userMiddleware, isBlocked,userCart);
router.get("/view-cart", userMiddleware, isBlocked,getUserCart);
router.post("/remove-item", userMiddleware, removeItem);
router.post("/update-quantity/:productId",isBlocked, userMiddleware, updateQuantity);
router.get("/checkout", userMiddleware, isBlocked,checkout);
router.post("/create-order", userMiddleware, createOrder);
router.post("/create-online-payment", userMiddleware, isBlocked,createOnlinePayment);
router.get("/thankyou", userMiddleware, isBlocked,thankyou);
router.get("/all-user", getallUser);
router.get("/orders", userMiddleware, getOrders);
router.get("/orders-details/:id", userMiddleware, getOrdersDetails);
router.get("/profile", userMiddleware, loadProfile);
router.post("/profile", userMiddleware, addAddress);
router.get("/logout", logout);
router.get("/login", loadlogin);
router.get("/refresh", handleRefreshToken);
router.get("/error", errorPage);

module.exports = router;

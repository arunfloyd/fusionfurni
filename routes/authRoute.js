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
  requestReturn,
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
  requestCancel,
  generatePdf,
} = require("../controller /userController");
const {
  userMiddleware,
  noCacheHeaders,
  isBlocked,
} = require("../middlewares/authMiddleware");
const router = express.Router();
router.get("/login", noCacheHeaders, loadlogin);
router.post("/login", loginUserCtrl);
router.get("/register", userRegister);
router.post("/register", createUser);
router.get("/register/:profileId", userRegister);
router.post("/register/:profileId", createUser);
router.get("/forget-password", loadForgetPassword);
router.post("/forget-password", forgotPasswordToken);
router.get("/reset-password/:token", loadChangePassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-mail", loadVerifyEmail);
router.post("/verify-mail", verifyMail);
router.post("/resend-mail", resendMail);
router.get("/shop", shop);
router.get("/", home);
router.get("/contact", contact);
router.get("/product/:id", product);
router.get("/blog", blog);
router.get("/services", services);
router.get("/about", about);
router.get("/wishlist", userMiddleware, isBlocked, loadWishlist);
router.post("/add-wishlist", userMiddleware, isBlocked, createWishlist);
router.post("/remove-wish", userMiddleware, isBlocked, removeWish);
router.post("/cart", userMiddleware, isBlocked, userCart);
router.get("/view-cart", userMiddleware, isBlocked, getUserCart);
router.post("/apply-coupon", userMiddleware, isBlocked, applyCoupon);
router.post("/remove-item", userMiddleware, removeItem);
router.post("/update-quantity/:productId", userMiddleware, updateQuantity);
router.get("/check-update", userMiddleware, updateQuantity);
router.get("/checkout", userMiddleware, isBlocked, checkout);
router.post("/create-order", userMiddleware, createOrder);
router.post(
  "/create-online-payment",
  userMiddleware,
  isBlocked,
  createOnlinePayment
);
router.post("/verify-payment", userMiddleware, verifyRazopay);

router.get("/thankyou", userMiddleware, isBlocked, thankyou);
router.get("/all-user", getallUser);
router.get("/orders", userMiddleware, getOrders);
router.get("/orders-details/:id", userMiddleware, getOrdersDetails);
router.get("/profile", userMiddleware, loadProfile);
router.post("/profile", userMiddleware, addAddressOnProfile);
router.post("/add-address", userMiddleware, addAddress);
router.get("/edit-address/:id", userMiddleware, editAddress);
router.post("/edit-address/:id", userMiddleware, updateAddress);
router.get("/edit-profile", userMiddleware, loadEditProfile);
router.post("/edit-profile", userMiddleware, editProfile);
router.get("/remove-address/:id", userMiddleware, removeAddress);
router.get("/logout", logout);
router.get("/login", loadlogin);
router.get("/refresh", handleRefreshToken);
router.get("/error", errorPage);
router.get("/request-return/:id", loadRequestReturn);
router.put("/request-return",userMiddleware, requestReturn);
router.get("/request-cancel/:id", loadRequestCancel);
router.put("/request-cancel",userMiddleware, requestCancel);
router.get("/wallet", userMiddleware, loadWallet);
router.post("/create-money", userMiddleware, loadMoney);
router.get('/download-pdf/:id',generatePdf);

module.exports = router;

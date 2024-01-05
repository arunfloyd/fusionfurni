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
} = require("../controller /userController");
const {
  userMiddleware,
  noCacheHeaders,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.get("/login", noCacheHeaders, loadlogin);
router.post("/login", loginUserCtrl);
router.get("/shop", shop);
router.get("/home", home);
router.get("/contact", contact);
router.get("/product/:id", product);
router.get("/blog", blog);
router.get("/services", services);
router.get("/cart", cart);
router.get("/about", about);
router.post("/cart", userMiddleware, userCart);
router.get("/view-cart", userMiddleware, getUserCart);
router.get("/checkout", userMiddleware, checkout);
router.get("/orders", userMiddleware, getOrders);
router.get("/create-order", userMiddleware, createOrder);
router.get("/thankyou", userMiddleware, thankyou);
router.get("/login", loadlogin);
router.get("/all-user", getallUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.post("/send", sendMail);
router.post("/verification", verifyMail);
router.post("/resendMail", resendMail);
router.get("/error", errorPage);
router.get("/profile", userMiddleware, loadProfile);
router.post("/profile", userMiddleware, addAddress);
router.post("/remove-item", userMiddleware, removeItem);

module.exports = router;

const express = require("express");
const {
  loginAdmin,
  loginAdminCtrl,
  dashboard,
  userList,
  addCategory,
  addProduct,
  product,
  loadaUser,
  updateaUser,
  deleteaUser,
  logout,
  updateOrderStatus,
  getAllOrders,
  loadUpdateOrderStatus,
} = require("../controller /adminController");
const {
  authMiddleware,
  noCacheHeaders,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/login", noCacheHeaders, loginAdmin);
router.post("/login", loginAdminCtrl);
router.get("/edit-user/:id", authMiddleware, loadaUser);
router.post("/edit-user/:id", authMiddleware, updateaUser);
router.get("/delete-user", authMiddleware, deleteaUser);
router.get("/users", authMiddleware, userList);
router.get("/category", authMiddleware, addCategory);
router.get("/addproduct", authMiddleware, addProduct);
router.get("/product", authMiddleware, product);
router.get("/dash", authMiddleware, dashboard);
router.get("/orders", authMiddleware, getAllOrders);
router.get("/update-status/:id", authMiddleware, loadUpdateOrderStatus);
router.post("/update-status/:id", authMiddleware, updateOrderStatus);
router.get("/logout", noCacheHeaders, logout);
module.exports = router;

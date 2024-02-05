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
  salesReport,
  salesGetReport,
  generatePdf,
  salesAllReport,
} = require("../controller /adminController");
const {
  authMiddleware,
  noCacheHeaders,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router
  .route("/login")
  .get(noCacheHeaders, loginAdmin)
  .post(loginAdminCtrl);
router
  .route("/edit-user/:id")
  .get(authMiddleware, loadaUser)
  .post(authMiddleware, updateaUser);

router
  .route("/sales-report")
  .get(authMiddleware, salesGetReport)
  router
  .route("/sales-report-date")
  .get(authMiddleware, salesGetReport)
router
  .route("/update-status/:id")
  .get(authMiddleware, loadUpdateOrderStatus)
  .post(authMiddleware, updateOrderStatus);
router.route("/delete-user").get(authMiddleware, deleteaUser);
router.route("/users").get(authMiddleware, userList);
router.route("/category").get(authMiddleware, addCategory);
router.route("/addproduct").get(authMiddleware, addProduct);
router.route("/product").get(authMiddleware, product);
router.route("/dash").get(authMiddleware, dashboard);
router.route("/orders").get(authMiddleware, getAllOrders);
router.route("/logout").get(noCacheHeaders, logout);
router.route("/download-pdf").get(generatePdf);

module.exports = router;

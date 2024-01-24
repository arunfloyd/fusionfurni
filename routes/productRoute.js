const express = require("express");
const {
  createProduct,
  getallProduct,
  updateProduct,
  deleteProduct,
  addProduct,
  loadUpdateProduct,
  updateImages,
} = require("../controller /productController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const upload = require("../config/config");
const multer = require("multer");

router.get("/add", authMiddleware, addProduct);
router.post('/add', upload.upload.array('image', 4), authMiddleware,createProduct)
router.get("/list", authMiddleware, getallProduct);
router.get("/:id", authMiddleware, loadUpdateProduct);
router.post("/delete/images", asyncHandler(updateImages));
router.post("/:id", authMiddleware, updateProduct);
router.get("/delete/:id", authMiddleware, deleteProduct);
module.exports = router;

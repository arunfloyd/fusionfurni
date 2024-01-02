const express = require("express");
const { createProduct,getaProduct,getallProduct,updateProduct,deleteProduct,addProduct,loadUpdate, loadUpdateProduct, updateImages } = require("../controller /productController");
const { isAdmin,authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();
const sharp = require('sharp');
const asyncHandler = require('express-async-handler')
const config = require('../config/config')
const multer = require('multer');
const storage = config.configureMulter();
const upload = multer({ storage: storage });

// router.get("/addproduct",authMiddleware,isAdmin,createProduct);
// router.post("/addproduct",authMiddleware,isAdmin,createProduct);
router.get("/add",authMiddleware,addProduct);
router.post("/add",upload.array('images'),authMiddleware, createProduct);

// router.get("/:id",getaProduct);
router.get("/list",authMiddleware,getallProduct);
// router.put("/:id",authMiddleware,isAdmin,updateProduct);
router.get("/:id",authMiddleware,loadUpdateProduct);
router.post("/delete/images", asyncHandler(updateImages));

router.post("/:id",authMiddleware,updateProduct);

// router.delete("/:id",authMiddleware,isAdmin,deleteProduct);
router.get("/delete/:id",authMiddleware,deleteProduct)
module.exports = router;
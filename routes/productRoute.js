const express = require("express");
const { createProduct,getaProduct,getallProduct,updateProduct,deleteProduct,addProduct,loadUpdate, loadUpdateProduct, updateImages } = require("../controller /productController");
const { isAdmin,authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

const asyncHandler = require('express-async-handler')
const config = require('../config/config')
const multer = require('multer');
const storage = config.configureMulter();
const upload = multer({ storage: storage });
// router.get("/addproduct",authMiddleware,isAdmin,createProduct);
// router.post("/addproduct",authMiddleware,isAdmin,createProduct);
router.get("/add",addProduct);
router.post("/add",upload.array('images'), createProduct);

// router.get("/:id",getaProduct);
router.get("/list",authMiddleware,getallProduct);
// router.put("/:id",authMiddleware,isAdmin,updateProduct);
router.get("/:id",loadUpdateProduct);
router.post("/delete/images", asyncHandler(updateImages));

router.post("/:id",updateProduct);

// router.delete("/:id",authMiddleware,isAdmin,deleteProduct);
router.get("/delete/:id",deleteProduct)
module.exports = router;
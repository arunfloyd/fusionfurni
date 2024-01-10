const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

const asyncHandler = require("express-async-handler");
const addProduct = asyncHandler(async (req, res) => {
  try {
    const category = await Category.find({ list: true });
    res.render("adminDash/indexAddProduct", {
      category: category,
      message: req.flash("message"),
    });
  } catch (error) {
    throw new Error("Add Product Can not Access");
  }
});

const createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      productDetails,
      specification,
      quantity,
      warranty,
    } = req.body;

    const images = req.files.map((file) => file.originalname);  

    const newProduct = await Product.create({
      title,
      description,
      price,
      images,
      category,
      productDetails,
      specification,
      warranty,
      quantity,
    });

    console.log("Product created successfully");

    res.redirect("/admin/product/list");
  } catch (error) {
    req.flash("message", "Error creating product");
    console.error(error);
  }
});

const updateImages = async function (req, res) {
  try {
    const { selectedImages } = req.body;

    // Perform deletion in the database (example using Mongoose)
    await Product.updateMany(
      { images: { $in: selectedImages } },
      { $pull: { images: { $in: selectedImages } } }
    );

    res.redirect("/admin/product/list");
    res.status(200).json({ message: "Images deleted successfully" });
  } catch (error) {
    console.error("Error deleting images:", error);
    res.status(500).json({ error: "Failed to delete images" }); // More informative error message
  }
};

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const {
      title,
      description,
      price,
      images,
      category,
      productDetails,
      specification,
      warranty,
      quantity,
      list,
      // Add other fields as needed
    } = req.body;

    // Check if the 'images' field is present and not empty
    const updateFields = {
      $set: {
        title,
        description,
        price,
        category,
        productDetails,
        specification,
        warranty,
        quantity,
        list,
        // Add other fields as needed
      },
    };

    if (images) {
      if (Array.isArray(images)) {
        // If images is an array, use $push with $each
        updateFields.$push = { images: { $each: images } };
      } else {
        // If images is a string, use $push without $each
        updateFields.$push = { images };
      }
    }

    const updateProduct = await Product.findOneAndUpdate(
      { _id: id },
      updateFields,
      { new: true }
    );

    res.redirect("/admin/product/list");
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).render("error", { error: "Failed to update product" });
  }
});

const   loadUpdateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.find({ list: true });
    const updateProduct = await Product.findById({ _id: id });
    res.render("adminDash/indexUpdateProduct", {
      updateProduct: updateProduct,
      category: category,
    });
  } catch (error) {
    // throw new Error(error)
    res.send(error);
    res.render("error");
  }
});
//Load Update Product

const loadUpdate = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const productData = await Product.findById(id);
  } catch (error) {
    // console.log(error.message)
    res.send(error);
    res.render("error");
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.deleteOne({ _id: id });
    res.redirect("/admin/product/list");
  } catch (error) {
    // console.log(error.message)
    res.send(error);
    res.render("error");
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (error) {
    // throw new Error(error)
    res.send(error);
    res.render("error");
  }
});
const getallProduct = asyncHandler(async (req, res) => {
  try {
    const getallProduct = await Product.find();
    res.render("adminDash/indexProductList", { getallProduct: getallProduct });
  } catch (error) {
    // throw new Error
    res.send(error);
    res.render("error");
  }
});
const loadaUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userData = await User.findById(id);
    if (userData) {
      res.render("adminDash/edit-user", { user: userData });
    } else {
      res.redirect("/admin/dash");
    }
  } catch (error) {
    // console.log(error.message)
    res.send(error);
    res.render("error");
  }
});

module.exports = {
  createProduct,
  getaProduct,
  getallProduct,
  updateProduct,
  deleteProduct,
  addProduct,
  loadUpdate,
  loadaUser,
  loadUpdateProduct,
  updateImages,
};

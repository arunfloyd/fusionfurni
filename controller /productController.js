const Product = require("../models/productModel");
const path = require('path');
const sharp = require('sharp');
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

const createProduct = async (req, res) => {
  try {
    const { title ,description,productDetails,specification,warranty,price,quantity,category}=req.body
    const resizedImages = [];

    for (let i = 0; i < req.files.length; i++) {
      const originalPath = req.files[i].path;
      const resizedPath = path.join(__dirname, "../public/resize", req.files[i].filename);
      await sharp(originalPath).resize(1100, 1210, { fit: "fill" }).toFile(resizedPath);
      console.log('Resized path:', resizedPath);
      resizedImages[i] = req.files[i].filename;

    }
    if (req.files.length !== 4 || req.files.length > 4) {

      // req.session.message = 'only 5 images allowed'
      req.flash('message','only 4 images allowed')
      res.redirect('/admin/product/list',)



    } else {
      const product = new Product({
        title: title,
        description: description,
        productDetails:productDetails,
        specification:specification,
        warranty:warranty,
        images: resizedImages,
        price: price,
        category: category,
        quantity:quantity,
        list: true

      })
      let productData = await product.save()
      req.flash('message','Product Created Sucess')
      if (!productData) {
        res.render('addProduct', { message: 'Invalid input' })
      } else {
        res.json({ success: true })
      }

    }
  } catch (error) {
    console.log(error.message);
    throw new Error(error)
  }
}


const updateImages = async function (req, res) {
  try {
    const { selectedImages } = req.body;

    await Product.updateMany(
      { images: { $in: selectedImages } },
      { $pull: { images: { $in: selectedImages } } }
    );

    res.redirect("/admin/product/list");
    res.status(200).json({ message: "Images deleted successfully" });
  } catch (error) {
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
    } = req.body;

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
      },
    };

    if (images) {
      if (Array.isArray(images)) {
        updateFields.$push = { images: { $each: images } };
      } else {
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
    res.status(500).render("error", { error: "Failed to update product" });
  }
});

const loadUpdateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.find({ list: true });
    const updateProduct = await Product.findById({ _id: id });
    res.render("adminDash/indexUpdateProduct", {
      updateProduct: updateProduct,
      category: category,
    });
  } catch (error) {
    throw new Error(error);
    res.render("error");
  }
});
//Load Update Product

const loadUpdate = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const productData = await Product.findById(id);
  } catch (error) {
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
const getallProducts = asyncHandler(async (req, res) => {
  try {
    const getallProduct = await Product.find();
    res.render("adminDash/indexProductList", { getallProduct: getallProduct });
  } catch (error) {
    // throw new Error
    res.send(error);
    res.render("error");
  }
});
const getallProduct = asyncHandler(async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 8;
    let search = "";
    let sortOrder = "";
    if (req.query.Search || req.query.Sort) {
      search = req.query.Search;
      sortOrder = req.query.Sort;
    }
    const sortingOptions = {
      default: {}, // Add your default sorting option here
      priceHigh: { price: -1 },
      priceLow: { price: 1 },
    };
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const totalProducts = await Product.countDocuments({
      $and: [
        {
          $or: [{ title: { $regex: ".*" + search + ".*", $options: "i" } }],
        },
      ],
    });
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const usersData = await Product.find({
      $and: [
        {
          $or: [{ title: { $regex: ".*" + search + ".*", $options: "i" } }],
        },
      ],
    })
      .sort(sortingOptions[sortOrder])
      .skip(skip)
      .limit(ITEMS_PER_PAGE);

    res.render("adminDash/indexProductList", {
      getallProduct: usersData,
      currentPage: page,
      totalPages: totalPages,
      search: search,
      sortOrder: sortOrder, message: req.flash("message")
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
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

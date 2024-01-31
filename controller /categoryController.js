const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");

const createCategory = asyncHandler(async (req, res) => {
  try {
    const title = req.body.title;
    const category = await Category.findOne({
      title: { $regex: new RegExp(title, "i") },
    });
    if (!category) {
      const newCategory = await Category.create(req.body);
      req.flash("message", "Category Created Successfully");
      res.redirect("/admin/category/list");
    } else {
      req.flash("message", "Category Title Already Exists");
      res.redirect("/admin/category/list");
    }
  } catch (error) {
    res.redirect("/admin/category/list");
  }
});

//update Category

const loadUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const getallCategory = await Category.findById(id);
    res.render("adminDash/indexEditCategory", {
      getallCategory: getallCategory,
      message: req.flash("message"),
    });
  } catch {
    // throw new Error(error)
    res.send(error);
    res.render("error");
  }
});
const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const title = req.body.title;

    const category = await Category.findOne({
      title: { $regex: new RegExp(title, "i") },
    });

    if (!category) {
      const updateProduct = await Category.findOneAndUpdate(
        { _id: id },
        req.body,
        { new: true }
      );
      req.flash("message", "Category Updated Successfully");
      res.redirect("/admin/category/list");
    } else {
      req.flash("message", "Category Title Already Exists");
      res.redirect("/admin/category/list");
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);

    // Pass the error message to the error template
    req.flash("message", "An error occurred. Please try again.");
    res.render("error", { error });
  }
});

//delete Category

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if(id !==0){
      const deleteCategory = await Category.findOneAndDelete({ _id: id });
      res.redirect("/admin/category/list");
    }else{
      req.flash("message","Not a proper ID")
      res.redirect('/admin/category')
    }
   
  } catch (error) {
    // throw new Error(error)
    res.send(error);
    res.render("error");
  }
});

const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const getCategory = await Category.findById(id);
    res.json(getCategory);
  } catch (error) {
    // throw new Error(error)
    res.send(error);
    res.render("error");
  }
});
const getallCategory = asyncHandler(async (req, res) => {
  try {
    const getallCategory = await Category.find();
    res.render("adminDash/indexAddCategory", {
      getallCategory: getallCategory,
      message: req.flash("message"),
    });
    res.json(getallCategory);
  } catch (error) {
    // throw new Error(error)
    res.send(error);
    res.render("error");
  }
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
  loadUpdate,
};

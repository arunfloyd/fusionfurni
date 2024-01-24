const User = require("../models/userModel");
const Offer = require("../models/offerModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");


const asyncHandler = require("express-async-handler");

const loadAddOffer = asyncHandler(async (req, res) => {
  try {
    const product = await Product.find({});
    const category = await Category.find({});
    res.render('adminDash/indexOffers',{product,category})
  } catch (error) {
    console.log(error)
    throw new Error(error);
  }
});
const addOffer = asyncHandler(async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
});
const loadEditOffer = asyncHandler(async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});
const editOffer = asyncHandler(async (req, res) => {
  try {
    console.log("haii");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const deleteOffer = asyncHandler(async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
    throw new Error(error);
  }
});

module.exports = {
  loadAddOffer,
  addOffer,
  deleteOffer,
  loadEditOffer,
  editOffer,
};

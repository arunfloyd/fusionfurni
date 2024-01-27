const User = require("../models/userModel");
const { OfferAssociation, Offer } = require("../models/offerModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

const asyncHandler = require("express-async-handler");

const loadAddOffer = asyncHandler(async (req, res) => {
  try {
    const product = await Product.find({});
    const category = await Category.find({});
    const offer = await OfferAssociation.find()
      .populate("associationId")
      .populate("offer")
      .exec();
    console.log(offer);

    res.render("adminDash/indexOffers", { product, category, offer });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});
const addOffer = asyncHandler(async (req, res) => {
  try {
    const {
      offer_name,
      startingDate,
      expiryDate,
      percentage,
      status,
      description,
      category,
      product,
      discountAmount,
      associationType,
    } = req.body;
    console.log(product);
    console.log(category);
    const productID = await Product.findOne({ title: product });
    const categoryID = await Category.findOne({ title: category });
    if (associationType !== "Product" && associationType !== "Category") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid associationType" });
    }
    const offer = new Offer({
      offer_name,
      startingDate,
      expiryDate,
      percentage,
      status,
      description,
    });
    const savedOffer = await offer.save();
    const associationId =
      associationType === "Product" ? productID._id : categoryID._id;

    const offerAssociation = new OfferAssociation({
      associationType,
      associationId,
      offer: savedOffer._id,
    });
    await offerAssociation.save();
    res.redirect("/admin/offers");
  } catch (error) {
    console.error("Error adding offer:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

const loadEditOffer = asyncHandler(async (req, res) => {
  try {
    const {id}= req.params;
    const product = await Product.find({});
    const category = await Category.find({});
    const offer = await OfferAssociation.findById(id)
    .populate("associationId")
    .populate("offer")
    .exec(); 
res.render('adminDash/indexEditOffers',{product,category,offer})
  

   } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});
const editOffer = asyncHandler(async (req, res) => {
  try {
      const { id } = req.params;
      const { offer_name, startingDate, expiryDate, percentage, status, description, category, product, associationType } = req.body;
      console.log('Received Data:', req.body);
      const offerAssociation = await OfferAssociation.findById(id);
      if (!offerAssociation) {
          return res.status(404).json({ success: false, error: 'OfferAssociation not found' });
      }
      const offer = await Offer.findById(offerAssociation.offer);
      if (!offer) {
          return res.status(404).json({ success: false, error: 'Offer not found' });
      }
      offer.offer_name = offer_name;
      offer.startingDate = startingDate;
      offer.expiryDate = expiryDate;
      offer.percentage = percentage;
      offer.status = status;
      offer.description = description;
      const updatedOffer = await offer.save();

      if (offerAssociation.associationType === 'Category') {
        const categorys = await Category.findOne({ title: category });
        offerAssociation.associationId = categorys._id;
    } else {
        const products = await Product.findOne({ title: product }); // Use Product instead of Category
        offerAssociation.associationId = products._id;
    }
    
    const updatedOfferAssociation = await offerAssociation.save();

      res.status(200).json({ message: 'Updation Completed' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

const deleteOffer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOfferAssociation = await OfferAssociation.findByIdAndDelete(id);
if (deletedOfferAssociation) {
    await Offer.findByIdAndDelete(deletedOfferAssociation.offer);
    console.log('OfferAssociation and associated Offer deleted successfully');
} 
res.status(200).json({ message: "Coupon deleted successfully" });
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

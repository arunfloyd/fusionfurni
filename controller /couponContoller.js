const User = require("../models/userModel");
const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");

const loadAddCoupon = asyncHandler(async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.render("adminDash/indexAddCoupon", {
      coupons,
      message: req.flash("message"),
    });
  } catch (error) {
    throw new Error(error);
  }
});
const addCoupon = asyncHandler(async (req, res) => {
  try {
    const { couponCode } = req.body;
    const couponAlready = await Coupon.findOne({ couponCode: couponCode });
    if (!couponAlready) {
      const coupon = await Coupon.create(req.body);
      console.log(coupon);
      req.flash("message", "New Coupon Created");
      res.redirect("/admin/coupon");
    } else {
      req.flash("message", "Coupon Code Already Exists");
      res.redirect("/admin/coupon");
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
});
const loadEditCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findOne({ _id: id });
    console.log(coupon);
    res.render("adminDash/indexEditCoupon", { coupon , message: req.flash("message")});
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});
const editCoupon = asyncHandler(async (req, res) => {
  try {
    console.log("haii");
    const { id } = req.params;
    const alreadyExist = await Coupon.findOne({ couponCode: { $regex: new RegExp(couponCode, 'i') } });
    if(!alreadyExist){
      const updatedCoupon = await Coupon.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
      });
  
      if (!updatedCoupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res
      .status(200)
      .json({ message: "Coupon updated successfully", coupon: updatedCoupon });
    }else{
      res
      .status(200)
      .json({ message: "Coupon Code Already Exists"});
    }
   

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
    throw new Error(error);
  }
});

module.exports = {
  loadAddCoupon,
  addCoupon,
  deleteCoupon,
  loadEditCoupon,
  editCoupon,
};

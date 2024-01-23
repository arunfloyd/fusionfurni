const User = require("../models/userModel");
const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");

const loadAddCoupon = asyncHandler(async(req,res)=>{
    try{
        const coupons = await Coupon.find({});
        res.render('adminDash/indexAddCoupon.ejs', {coupons ,message: req.flash("message")})

    }catch(error){
        throw new Error(error)
    }
})
const addCoupon = asyncHandler(async (req, res) => {
    try {
      const { couponCode } = req.body;
      const couponAlready = await Coupon.findOne({ couponCode: couponCode });
  
      if (!couponAlready) {
        const coupon = await Coupon.create(req.body);
        console.log(coupon);
        req.flash("message", "New Coupon Created");
        res.redirect('/admin/coupon');
      } else {
        req.flash("message", "Coupon Code Already Exists");
        res.redirect('/admin/coupon');
      }
  
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  });
  const loadEditCoupon = asyncHandler(async(req,res)=>{
    try{

    }catch(error){
        console.log(error)
        throw new Error(error)
    }
  })
  const editCoupon = asyncHandler(async(req,res)=>{
    try{

    }catch(error){
        console.log(error)
        throw new Error(error)
    }
  })
  const deleteCoupon = asyncHandler(async(req,res)=>{
    try{
        
    }catch(error){
        console.log(error)

        throw new Error(error)
    }
  })
  

module.exports = {loadAddCoupon,addCoupon};
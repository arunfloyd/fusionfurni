// const { isValidObjectId } = require("mongoose");
const { Cart } = require("../models/cartModel");
const { User } = require("../models/userModel");
const Product = require("../models/productModel")
const Category =require('../models/categoryModel');
const asyncHandler =require("express-async-handler")
// const addItemToCart = asyncHandler(async (req, res) => {
//   try{
//   let userId = req.params.userId;
//   let user = await User.exists({ _id: userId });
// console.log(user)
//   if (!userId  || !user)
//     return res.status(400).send({ status: false, message: "Invalid user ID" });

//   let productId = req.body.productId;
//   if (!productId)
//     return res.status(400).send({ status: false, message: "Invalid product" });

//   let cart = await Cart.findOne({ userId: userId });

//   if (cart) {
//     let itemIndex = cart.products.findIndex((p) => p.productId == productId);

//     if (itemIndex > -1) {
//       let productItem = cart.products[itemIndex];
//       productItem.quantity += 1;
//       cart.products[itemIndex] = productItem;
//     } else {
//       cart.products.push({ productId: productId, quantity: 1 });
//     }
//     cart = await cart.save();
//     return res.status(200).send({ status: true, updatedCart: cart });
//   } else {
//     const newCart = await Cart.create({
//       userId,
//       products: [{ productId: productId, quantity: 1 }],
//     });

//     return res.status(201).send({ status: true, newCart: newCart });
//   }} catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
const addItemToCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let products = [];
    const user = await User.findById(_id);
    // check if user already have product in cart
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }
    let newCart = await new Cart({
      products,
      cartTotal,
      orderby: user?._id,
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  // validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});


exports.getCart = async (req, res) => {
  let userId = req.params.userId;
  let user = await User.exists({ _id: userId });

  if (!userId || !isValidObjectId(userId) || !user)
    return res.status(400).send({ status: false, message: "Invalid user ID" });

  let cart = await Cart.findOne({ userId: userId });
  if (!cart)
    return res
      .status(404)
      .send({ status: false, message: "Cart not found for this user" });

  res.status(200).send({ status: true, cart: cart });
};

exports.decreaseQuantity = async (req, res) => {
  // use add product endpoint for increase quantity
  let userId = req.params.userId;
  let user = await User.exists({ _id: userId });
  let productId = req.body.productId;

  if (!userId || !isValidObjectId(userId) || !user)
    return res.status(400).send({ status: false, message: "Invalid user ID" });

  let cart = await Cart.findOne({ userId: userId });
  if (!cart)
    return res
      .status(404)
      .send({ status: false, message: "Cart not found for this user" });

  let itemIndex = cart.products.findIndex((p) => p.productId == productId);

  if (itemIndex > -1) {
    let productItem = cart.products[itemIndex];
    productItem.quantity -= 1;
    cart.products[itemIndex] = productItem;
    cart = await cart.save();
    return res.status(200).send({ status: true, updatedCart: cart });
  }
  res
    .status(400)
    .send({ status: false, message: "Item does not exist in cart" });
};

exports.removeItem = async (req, res) => {
  let userId = req.params.userId;
  let user = await User.exists({ _id: userId });
  let productId = req.body.productId;

  if (!userId || !isValidObjectId(userId) || !user)
    return res.status(400).send({ status: false, message: "Invalid user ID" });

  let cart = await Cart.findOne({ userId: userId });
  if (!cart)
    return res
      .status(404)
      .send({ status: false, message: "Cart not found for this user" });

  let itemIndex = cart.products.findIndex((p) => p.productId == productId);
  if (itemIndex > -1) {
    cart.products.splice(itemIndex, 1);
    cart = await cart.save();
    return res.status(200).send({ status: true, updatedCart: cart });
  }
  res
    .status(400)
    .send({ status: false, message: "Item does not exist in cart" });
};

module.exports ={addItemToCart,getUserCart}
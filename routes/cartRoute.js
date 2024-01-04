const express = require('express');
const {addItemToCart, getUserCart} = require("../controller /CartController")
const router = express.Router();

router.get('/add',getUserCart)
router.post('/add',addItemToCart)

module.exports = router
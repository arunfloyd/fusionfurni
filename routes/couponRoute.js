const express = require('express');
const router = express.Router();
const {loadAddCoupon, addCoupon} = require('../controller /couponContoller')

router.get('/',loadAddCoupon);
router.post('/',addCoupon);

module.exports =router
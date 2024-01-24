const express = require("express");
const router = express.Router();
const {
  loadAddCoupon,
  addCoupon,
  deleteCoupon,
  loadEditCoupon,
  editCoupon,
} = require("../controller /couponContoller");

router.get("/", loadAddCoupon);
router.post("/", addCoupon);
router.delete("/delete/:id", deleteCoupon);
router.get("/:id", loadEditCoupon);
router.put("/:id", editCoupon);

module.exports = router;

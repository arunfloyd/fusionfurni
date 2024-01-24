const express = require("express");
const router = express.Router();
const {
  loadAddOffer,
  addOffer,
  deleteOffer,
  loadEditOffer,
  editOffer,
} = require("../controller /offerController");

router.get("/", loadAddOffer);
router.post("/", addOffer);
router.delete("/delete/:id", deleteOffer);
router.get("/:id", loadEditOffer);
router.put("/:id", editOffer);

module.exports = router;

const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
  loadUpdate,
} = require("../controller /categoryController");
const { authMiddleware} = require("../middlewares/authMiddleware");
const router = express.Router();
router.post("/", authMiddleware, createCategory);
router.put("/:id", authMiddleware, updateCategory);
router.delete("/:id", authMiddleware, deleteCategory);
router.get("/edit/:id", authMiddleware, loadUpdate);
router.post("/edit/:id", authMiddleware, updateCategory);
router.get("/list", authMiddleware, getallCategory);
router.get("/delete/:id", authMiddleware, deleteCategory);
router.post("/list", authMiddleware, createCategory);
router.get("/:id", authMiddleware, getCategory);
module.exports = router;

const express = require("express");
const { createCategory, updateCategory, deleteCategory, getCategory, getallCategory,loadUpdate } = require("../controller /categoryController");
const { authMiddleware,isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();
// router.post('/',authMiddleware,isAdmin,createCategory)
// router.put('/:id',authMiddleware,isAdmin,updateCategory)
// router.delete('/:id',authMiddleware,isAdmin,deleteCategory)
// router.get('/:id',authMiddleware,isAdmin,getCategory)
// router.get('/',authMiddleware,isAdmin,getallCategory)
router.post('/',createCategory)
router.put('/:id',updateCategory)
router.delete('/:id',deleteCategory)
router.get('/edit/:id',loadUpdate)
router.post('/edit/:id',updateCategory)
router.get('/list',getallCategory)
router.get('/delete/:id',deleteCategory)
router.post('/list',createCategory)
router.get('/:id',getCategory)


module.exports = router;
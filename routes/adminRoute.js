const express =require('express')
const {loginAdmin,loginAdminCtrl,dashboard,userList,addCategory,addProduct,product,loadaUser,updateaUser,deleteaUser, loadDelete,loadDeleteUser,accessOff,accessOn, updateCategoryStatus, logout} = require('../controller /authController');
const {authMiddleware} = require("../middlewares/authMiddleware");
const router =express.Router();

router.get('/login', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache');
    next();
  }, loginAdmin);
router.post('/login',loginAdminCtrl);
router.post('/accessOn',updateCategoryStatus);
router.post('/accessOff',updateCategoryStatus);
router.get('/edit-user/:id',authMiddleware,loadaUser);
router.post('/edit-user/:id',authMiddleware,updateaUser)
router.get('/delete-user', authMiddleware,deleteaUser);
router.get('/users',authMiddleware,userList);
router.get('/category',authMiddleware,addCategory);
router.get('/addproduct',authMiddleware,addProduct);
router.get('/product',authMiddleware,product);
router.get('/dash',authMiddleware,dashboard);
// router.get('/logout',logout);
router.get('/logout', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache');
  next();
}, logout);



module.exports = router ; 
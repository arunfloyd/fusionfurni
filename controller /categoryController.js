const Category =require('../models/categoryModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId= require("../utils/validateMongodbid");
//create Category
const createCategory = asyncHandler(async (req,res)=>{
    try{
        const newCategory = await Category.create(req.body);
        res.redirect('/admin/category/list')
        res.json(newCategory)
    }catch(error){
        // throw new Error(error)
        res.send(error)
        res.render('error')
    }
});
//update Category

const loadUpdate = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    try {
        const getallCategory = await Category.findById(id)
        res.render('adminDash/indexEditCategory',{getallCategory:getallCategory})

    
    }catch{
        // throw new Error(error)
        res.send(error)
        res.render('error')
    }
})
const updateCategory = asyncHandler(async (req,res)=>{
    const {id} = req.params;
    try{
        // const updateCategory = await Category.findByIdAndUpdate(id)
        const updateProduct= await Category .findOneAndUpdate({_id: id},req.body,{
            new:true,
        });
        res.redirect('/admin/category/list')
    }catch(error){
        // throw new Error(error)
        res.send(error)
        res.render('error')
    }
});
//delete Category

const deleteCategory = asyncHandler(async (req,res)=>{
    const {id} = req.params;
    try{
        const deleteCategory = await Category.findOneAndDelete({_id:id})
        res.redirect('/admin/category/list')
    }catch(error){
        // throw new Error(error)
        res.send(error)
        res.render('error')
    }
});

const getCategory = asyncHandler(async (req,res)=>{
    const {id} = req.params;
    try{
        const getCategory = await Category.findById(id)
        res.json(getCategory)
    }catch(error){
        // throw new Error(error)
        res.send(error)
        res.render('error')
    }
});
const getallCategory = asyncHandler(async (req,res)=>{
    try{
        const getallCategory = await Category.find()
        res.render('adminDash/indexAddCategory',{getallCategory:getallCategory})
        res.json(getallCategory)
    }catch(error){
        // throw new Error(error)
        res.send(error)
        res.render('error')
    }
});

module.exports ={createCategory,updateCategory,deleteCategory,getCategory,getallCategory,loadUpdate}
const { default: slugify } = require("slugify");
const Product = require("../models/productModel")
const Category =require('../models/categoryModel');

const asyncHandler =require("express-async-handler")
const addProduct = asyncHandler(async(req,res)=>{
    try{
        const category = await Category.find({list:true});
        res.render('adminDash/indexAddProduct',{category:category, message: req.flash('message') })
    }catch(error){
        throw new Error("Add Product Can not Access")
    }
})
// const createProduct = asyncHandler(async(req,res)=>{
//     try{
//         const image = req.file ? req.file.path : '';
//         const newProduct = await Product.create(req.body);
//         res.redirect('/admin/product/list')
// res.json(newProduct);
//     }catch(error){
//         throw new Error(error)
//     }

// });
// const createProduct = asyncHandler(async (req, res) => {
//     try {
//         // Extract fields from the form data
//         const { title, slug, description, price,category ,productDetails,specification,} = req.body;
//         // Assuming 'image' is the name attribute of the file input in your form
//         const images = req.file ? req.file.originalname : '';// Assuming Multer has saved the file path
//         console.log(images)

//         try{
//             const newProduct = await Product.create({
//                 title,
//                 slug,
//                 description,
//                 price,
//                 images,
//                 category,
//                 productDetails,
//                 specification,
//                 warranty
//                 // Add other fields as needed
//             });
//         }catch (error) {
//             console.error(error);  // Log the error for debugging
//             res.status(500).send('Error creating product');
//         }
//         // Create the new product
        
//         console.log("Hello")

//         // Redirect or send a response as appropriate
//         res.redirect('/admin/product/list');
//     } catch (error) {
//         // Handle errors appropriately
//         res.status(500).send('Error creating product');
//     }
// });

const createProduct = asyncHandler(async (req, res) => {
    try {
        const { title, description, price, category, productDetails, specification ,quantity,warranty} = req.body;

        // Assuming 'mainImage' is the name attribute for the main image input
        // const image = req.file ? req.file.originalname : '';

        // Assuming 'subImages' is the name attribute for the sub-images input
        const images = req.files.map(file => file.originalname);

        const newProduct = await Product.create({
            title,
            description,
            price,
            images,
            category,
            productDetails,
            specification,
            warranty,
            quantity
            // Add other fields as needed
        });

        console.log("Product created successfully");

        res.redirect('/admin/product/list');
    } catch (error) {
        req.flash('message', 'Error creating product');
        console.error(error);
       
    }
});
// const updateImages =async function (req, res) {
//     try {
//         const { selectedImages } = req.body;

//         // Perform the actual deletion in your database or file system
//         // For example, using Mongoose for MongoDB:
//         await Product.updateMany(
//             { images: { $in: selectedImages } },
//             { $pull: { images: { $in: selectedImages } } }
//         );

//         res.status(200).json({ message: 'Images deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting images:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }
const updateImages = async function (req, res) {
    try {
      const { selectedImages } = req.body;
  
      // Perform deletion in the database (example using Mongoose)
      await Product.updateMany(
        { images: { $in: selectedImages } },
        { $pull: { images: { $in: selectedImages } } }
      );
  
  res.redirect('/admin/product/list')
      res.status(200).json({ message: 'Images deleted successfully' });
    } catch (error) {
      console.error('Error deleting images:', error);
      res.status(500).json({ error: 'Failed to delete images' }); // More informative error message
    }
  };


//Update Product
// const updateProduct = asyncHandler(async(req,res)=>{
//     const {id} = req.params;
//     try{
//         const updateProduct= await Product.findOneAndUpdate({_id: id},req.body,{
//             new:true,
//         });
//         res.redirect('/admin/product/list')
//         res.render('adminDash/indexUpdateProduct',{updateProduct:updateProduct})
        
//     }catch(error){
//         throw new Error(error)
//     }
// })
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    try {
      const {
        title,
        description,
        price,
        images,
        category,
        productDetails,
        specification,
        warranty,
        quantity
        // Add other fields as needed
      } = req.body;
  
      // Check if the 'images' field is present and not empty
      const updateFields = {
        $set: {
          title,
          description,
          price,
          category,
          productDetails,
          specification,
          warranty,
          quantity
          // Add other fields as needed
        },
      };
  
      if (images && images.length > 0) {
        updateFields.$push = { images: { $each: images } };
      }
  
      const updateProduct = await Product.findOneAndUpdate(
        { _id: id },
        updateFields,
        { new: true }
      );
  
      res.redirect('/admin/product/list');
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).render('error', { error: 'Failed to update product' });
    }
  });
  
  
  
const loadUpdateProduct = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    try{
        const category = await Category.find({list:true})
        const updateProduct= await Product.findById({_id: id});
        res.render('adminDash/indexUpdateProduct',{updateProduct:updateProduct,category:category})
        
    }catch(error){
        throw new Error(error)
    }
})
//Load Update Product

const loadUpdate = asyncHandler(async(req,res)=>{
    try {
        const { id } = req.params   
        const productData = await Product.findById(id);
        // if (productData) {
        //     res.render('adminDash/indexAddProduct', { productData: productData })
        // } else {
        //     res.redirect('/admin/dash')
        // }
    } catch (error) {
        console.log(error.message)
    }})
//Delete Product
// const deleteProduct = asyncHandler(async(req,res)=>{
//     const {id} = req.params;
//     try{
        
//         const deleteProduct= await Product.findOneAndDelete({_id: id},req.body,{
//             new:true,
//         });
//         res.json(deleteProduct)
//     }catch(error){
//         throw new Error(error)
//     }
// })
// const deleteProduct = async(req, res) => {
//     try {
//          const { id } = req.params;
//          const deleteProduct= await Product.findOneAndDelete({_id: id},req.body,{
//                         new:true,
//                     });
//         // await Product.deleteOne({ _id: req.query.id })
//         res.redirect('/admin/user')
//     } catch (error) {
//         console.log("let me sing")
//     }
// }
const deleteProduct = asyncHandler( async(req, res) => {
    const { id } = req.params;
    try {
       const deletedProduct =  await Product.deleteOne({ _id: id })
        res.redirect('/admin/product/list')
    } catch (error) {   
        console.log(error.message)
    }
});


const getaProduct = asyncHandler (async(req,res)=>{
    const {id}= req.params;
    try{
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    }catch(error){
        throw new Error(error)
    }
});
const getallProduct = asyncHandler(async(req,res)=>{
    try{
        const getallProduct = await Product.find();
        res.render("adminDash/indexProductList",{getallProduct:getallProduct})
    }catch(error){
        throw new Error
    }
})
const loadaUser = asyncHandler(async(req,res)=>{
    try {
        const { id } = req.params   
        const userData = await User.findById(id)
        if (userData) {
            res.render('adminDash/edit-user', { user: userData })
        } else {
            res.redirect('/admin/dash')
        }

    } catch (error) {
        console.log(error.message)
    }})

module.exports ={createProduct,getaProduct,getallProduct,updateProduct,deleteProduct,addProduct,loadUpdate,loadaUser,loadUpdateProduct,updateImages}
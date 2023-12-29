const { generateToken } = require("../config/jwtToken");
const User= require("../models/userModel");
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken")


// login for Admin
const loginAdmin = asyncHandler(async (req,res)=>{
    try{
  const token = req.cookies.refreshToken;
  if(token){
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    const user = await User.findById(decoded?.id);
    if (user.role === "admin") {
        // Redirect to the admin dashboard
        res.redirect('/admin/dash');
      } else {
        // Handle the case where the user is not an admin
        res.render('adminLogs', { message: 'Access denied. User is not an admin.' });
      }
     }else{
            res.render('adminLogs',{ message: req.flash('message') })

        }
    }catch(error){
        res.send(error)
        res.render('error')
    }
})
const loginAdminCtrl = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const adminUser = await User.findOne({ email });

        if (adminUser && (await adminUser.isPasswordMatched(password)) && adminUser.role === "admin") {
            const refreshToken = await generateRefreshToken(adminUser?._id);

            // Update the user with the new refresh token
            const updateuser = await User.findByIdAndUpdate(
                adminUser.id,
                {
                    refreshToken: refreshToken,
                },
                {
                    new: true,
                }
            );


            // Set the refresh token as a cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000,
            });

            // Redirect to the admin index page
            res.redirect('/admin/dash');
            res.status(200).send({ token: refreshToken });
          


        } else {
            // If login fails, flash an error message and redirect to the admin login page
            req.flash('message', 'Invalid credentials');
            // res.render('adminLogs')
            res.redirect('/admin/login');
        }
    } catch (error) {
        // If an unexpected error occurs, flash an error message and redirect to the admin login page
        req.flash('message', 'Unexpected error');
        // res.render('adminLogs')
        res.redirect('/admin/login');
        
    }
});
// const loginAdminCtrl = asyncHandler(async(req,res)=>{
//     try{ 
//     const{email,password}=req.body;
//    //check if user exists or not
//     const adminUser = await User.findOne({email});
//     if(adminUser && await adminUser.isPasswordMatched(password ) && (adminUser.role =="admin")){
//         const refreshToken = await generateRefreshToken(adminUser?._id);
//         const updateuser = await User.findByIdAndUpdate(
//             adminUser.id,{
//                 refreshToken:refreshToken,
//             },{
//                 new:true
//             }
//         );
//         res.cookie('refreshToken',refreshToken,{    
//             httpOnly:true,
//             maxAge:72*60*60*1000
//         })
//         res.render('index')
//     }else{ 
//         req.flash('message', 'Invalid Credentials');

//     }
// }catch(error){
//             req.flash('message', 'Unexpeted Error');
//             res.redirect('/admin/login')

// }
// });s



//Dashboard

const dashboard = asyncHandler(async(req,res)=>{
    try {
        res.render('adminDash/indexHome')
    }catch(error){
        res.send(error)
        res.render('error')
        
    }
})
//Product List 

const product = asyncHandler(async(req,res)=>{
    try{
        res.render('adminDash/indexProductList')
    }catch(error){
        res.send(error)
        res.render('error')
        // throw new Error("Product list can not Access")
    }
})
//Add Product
const addProduct = asyncHandler(async(req,res)=>{
    try{
        res.render('adminDash/indexAddProduct')
    }catch(error){
        // throw new Error("Add Product Can not Access")
        res.send(error)
        res.render('error')
    }
})

//Add Category

const addCategory = asyncHandler(async(req,res)=>{
    try{
        res.render("adminDash/indexAddCategory")
    }catch(error){
        // throw new Error("Add Product Can not Access")
        res.send(error)
        res.render('error')
    }
})

//User List 

const getallUser = asyncHandler(async(req,res)=>{
    try{
        res.render("adminDash/indexUserList")
        
    }catch(error){
        // throw new Error ("User List can not Access")
        res.send(error)
        res.render('error')
    }
})
const userList= asyncHandler(async(req,res)=>{
    try{
        const getUsers =await User.find();
        res.render("adminDash/indexUserList",{users:getUsers, message: req.flash('message') })
        console.log(getUsers.name)
        // res.json(getUsers);
    }catch(err){
        // throw new Error(error)
        res.send(error)
        res.render('error')
    }
 })
 const loadaUser = asyncHandler(async(req,res)=>{
    try {
        const { id } = req.params   
        const userData = await User.findById({_id:id})
        if (userData) {
            res.render('adminDash/edit-user', { user: userData })
        } else {
            res.redirect('/admin/dash')
        }

    } catch (error) {
        // console.log(error.message)
        res.send(error)
        res.render('error')
    }})
// const updateaUser = asyncHandler(async(req,res)=>{
//     try{
//     const userData = await User.findByIdAndUpdate({ _id: req.body.id }, { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mobile } })
//     req.flash('message', 'Updated Sucessfully');
//     res.redirect('/admin/users')
//                 res.json(userData);
//     }catch(error){
//         throw new Error("Update a user cant access")
//     }
// });
const updateaUser = asyncHandler(async(req,res)=>{
    try{
        const userData = await User.findByIdAndUpdate({ _id: req.body.id }, { $set: {  accessStatus:req.body.accessStatus} })

      
        res.redirect('/admin/users')
       
    }catch(error){
        // throw new Error(error)
        res.send(error)
        res.render('error')
    }
 })
const loadDelete = asyncHandler(async (req,res)=>{
    try {
        const { id } = req.params   
        const userData = await User.findById(id)
        if (userData) {
            res.render('adminDash/delete-user', { userData: userData,message: req.flash('message') })
        } else {
            res.redirect('/admin/dash')
        }

    } catch (error) {
        // console.log(error.message)
        res.send(error)
        res.render('error')
    }});


// const deleteaUser =asyncHandler(async(req,res)=>{
//     const id = req.params.id;
//     console.log(id)
//     try{
//         const userData = await User.findByIdAndDelete(id)
//                     res.redirect('/admin/users')
//                     res.json(userData);
//         }catch(error){
//             throw new Error("delete a user cant access")
//         }});
    
    // // const { id } =req.params;
    // // validateMongoDbId(id);
    // console.log(req.body.id );
    // const {id}=req.params.id
    // try{
    //     const deleteaUser = await User.findByIdAndDelete(id);
    //     // res.redirect('/admin/users')
    //     res.json({      
    //         deleteaUser,
    //     })
    // }catch(error){
    //     throw new Error(error)
    // }
    

    
    
    // const { _id }= req.user;
    // console.log(_id);
    // validateMongoDbId(_id);
    // try{
    //     const updatedUser=await User.findByIdAndUpdate(
    //         _id,{
    //             name:req?.body?.name,
    //             email:req?.body?.email,
    //             mobile:req?.body?.mobile,
    //         },{
    //             new:true,
    //         }
    //     );
    //     // res.render('adminDash/edit-user')
    //     res.json(updatedUser);
    // }catch(error){
    //     throw new Error(error)
    // }
 //Get a single Users
//  const deleteaUser = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     console.log('Received request to delete user with id:', id);
//     try {
//       const userData = await User.deleteOne({_id:id});
//       if (!userData) {
//         return res.status(404).json({ message: 'User not found' });
//       }
  
//       res.redirect('/admin/users');
//       res.json(userData);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   });
const deleteaUser = async(req, res) => {
    try {
        await User.deleteOne({ _id: req.query.id })
        req.flash('message', 'Deleted the User Sucessfully');
        res.redirect('/admin/users')
    } catch (error) {
        // console.log(error.message)
        res.send(error)
        res.render('error')
    }
}

  const loadDeleteUser = async(req, res) => {
    try {
        await User.deleteOne({ _id: req.query.id })
        res.redirect('/admin/dashboard')
    } catch (error) {
        // console.log(error.message)
        res.send(error)
        res.render('error')
    }
}
const getaUser =asyncHandler(async(req,res)=>{
    
    const { id } =req.params;
    // validateMongoDbId(id);
    try{
        const getaUser = await User.findById(id);
        res.json({
            getaUser
        })
    }catch(error){
        // throw new Error(error)
        res.send(error)
        res.render('error')
    }
    
})
// const accessOn = asyncHandler(async (req, res) => {
//     try {
        
//       const { id } = req.params;
//       console.log(id);
//       const userData = await User.findByIdAndUpdate(
//         { _id: id },
//         { $set: { accessStatus: true } },
//         { new: true } // This option returns the modified document
//       );
        
//       // If you want to redirect
//       res.redirect('/admin/users');
  
//       // If you want to send JSON response, uncomment the following line and comment out the redirect
//       // res.json(userData);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Error updating user access status" });
//     }
//   });
//   const accessOff = asyncHandler(async (req, res) => {
//     try {
        
//       const { id } = req.params;
//       console.log(id);
//       const userData = await User.findByIdAndUpdate(
//         { _id: id },
//         { $set: { accessStatus: false } },
//         { new: true } // This option returns the modified document
//       );
        
//       // If you want to redirect
//       res.redirect('/admin/users');
  
//       // If you want to send JSON response, uncomment the following line and comment out the redirect
//       // res.json(userData);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Error updating user access status" });
//     }
//   });
// const accessOn = asyncHandler(async (req, res) => {
//     try {
//       const { id } = req.params;
//       const userData = await User.findByIdAndUpdate(
//         { _id: id },
//         { $set: { accessStatus: true } },
//         { new: true }
//       );
  
//       res.redirect('/admin/users'); // Or send JSON response if needed
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Error updating user access status" });
//     }
//   });
const accessOn = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        const category = await User.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        category.accessStatus = !category.accessStatus;
        await category.save();
        res.json({ success: true, message: 'Category status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
const accessOff = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        const category = await User.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        category.accessStatus = !category.accessStatus;
        await category.save();
        res.json({ success: true, message: 'Category status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
const updateCategoryStatus = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        const category = await User.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        category.accessStatus = !category.accessStatus;
        await category.save();
        res.json({ success: true, message: 'Category status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
//   const accessOff = asyncHandler(async (req, res) => {
//     try {
//       const { id } = req.params;
//       const userData = await User.findByIdAndUpdate(
//         { _id: id },
//         { $set: { accessStatus: false } },
//         { new: true }
//       );
  
//       res.redirect('/admin/users'); // Or send JSON response if needed
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Error updating user access status" });
//     }
//   });
  
  
//Delete a User
// const logout = asyncHandler(async(req,res)=>{
//     const cookie = req.cookies;
//     if(!cookie?.refreshToken) throw new Error ("No Refresh Token in Cookies");
//     const refreshToken = cookie.refreshToken;
//     const user = await User.findOne({refreshToken});
//     if(!user){
//         res.clearCookie("refreshToken",{
//             httpOnly:true,
//             secure:true,
//         });
//         return res.sendStatus(204);//forbidden
//     }
//     await User.findOne({refreshToken:refreshToken},{
//         refreshToken:"",
//     });
//     res.clearCookie("refreshToken",{
//         httpOnly:true,
//         secure:true,
//     });
//     req.flash('message', ' Logout Successfully ');
//     res.redirect('/admin/login')
//      res.sendStatus(204);//forbidden
//  });
const logout = asyncHandler(async(req, res) => {
    try{
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });

    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204); // Forbidden
    }

    await User.findOne({ refreshToken: refreshToken }, {
        refreshToken: "",
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    });

    // Add cache control headers to prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    req.flash('message', ' Logout Successfully ');
    res.redirect('/admin/login');
    res.sendStatus(204);}
    catch{
        res.send(error)
        res.render('error')
    } // Forbidden
});

module.exports ={loginAdminCtrl,getallUser,deleteaUser,getaUser,loginAdmin,dashboard,userList,addCategory,addProduct,product,loadaUser,updateaUser,loadDelete,loadDeleteUser,accessOff,accessOn,updateCategoryStatus,logout}
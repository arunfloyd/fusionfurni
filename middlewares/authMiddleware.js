const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler =require("express-async-handler");

// const authMiddleware = asyncHandler(async (req, res, next) => {
//     let token;

//     // Check if the authorization header contains a token
//     if (req?.headers?.authorization?.startsWith("Bearer")) {
//         token = req.headers.authorization.split(" ")[1];

//         try {
//             if (token) {
//                 const decoded = jwt.verify(token, process.env.JWT_SECRET);
//                 const user = await User.findById(decoded?.id);
//                 req.user = user;
//                 next();
//             }
//         } catch (error) {
//             throw new Error("No Authorized token expired, Please Login again");
//         }
//     } else {
//         // If there is no token in the authorization header, check for the refresh token in cookies
//         const refreshToken = req.cookies.refreshToken;

//         try {
//             if (refreshToken) {
//                 // Verify the refresh token (you need to implement this verification logic)
//                 const decoded = verifyRefreshToken(refreshToken);
                
//                 // Retrieve the user based on the decoded information from the refresh token
//                 const user = await User.findById(decoded?.id);
                
//                 // Set the user in the request object
//                 req.user = user;

//                 // Continue to the next middleware or route handler
//                 next();
//             } else {
//                 throw new Error("There is no token attached to header or refresh token in cookies");
//             }
//         } catch (error) {
//             throw new Error("No Authorized token expired, Please Login again");
//         }
//     }
// });

const authMiddleware = asyncHandler(async(req,res,next)=>{
  const token = req.cookies.refreshToken;
    // let token;  
    // const { authorization } = req.headers
    // if (authorization && authorization.startsWith('Bearer')){
    // if(req?.headers?.authorization?.startsWith("Bearer")){
    //     token=req.headers.authorization.split(" ")[1];

        try{
            if(token){
                const decoded = jwt.verify(token,process.env.JWT_SECRET);
                const user = await User.findById(decoded?.id);
                req.user=user;
                next();
            }else{
                res.redirect('/admin/login')
                
              throw new Error("There is no token attached to header")
          }
        }catch(error){
            throw new Error("No Authorized token expired, Please Login again");

        }
    
});
const userMiddleware = asyncHandler(async(req,res,next)=>{
    const token = req.cookies.refreshToken;
      // let token;  
      // const { authorization } = req.headers
      // if (authorization && authorization.startsWith('Bearer')){
      // if(req?.headers?.authorization?.startsWith("Bearer")){
      //     token=req.headers.authorization.split(" ")[1];
  
          try{
              if(token){
                  const decoded = jwt.verify(token,process.env.JWT_SECRET);
                  const user = await User.findById(decoded?.id);
                  req.user=user;
                  next();
              }else{
                  res.redirect('/user/login')
                  
                throw new Error("There is no token attached to header")
            }
          }catch(error){
              throw new Error("No Authorized token expired, Please Login again");
  
          }
      
  });

// const authMiddleware = asyncHandler(async (req, res, next) => {
//     let token;
  
//     try {
//       if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//         token = req.headers.authorization.split(" ")[1];
  
//         // Log the token for debugging
//         console.log("Extracted token:", token);
  
//         if (token) {
//           const decoded = jwt.verify(token, process.env.JWT_SECRET);
//           console.log("Decoded token:", decoded);
  
//           const user = await User.findById(decoded.id);
  
//           if (user) {
//             req.user = user;
//             next();
//           } else {
//             throw new Error("User not found");
//           }
//         } else {
//           throw new Error("Invalid token format");
//         }
//       } else {
//         throw new Error("Authorization header not present or invalid format");
//       }
//     } catch (error) {
//       console.error("Auth middleware error:", error);
//       res.status(401).json({ message: "Unauthorized" });
//     }
//   });
  
const isAdmin = asyncHandler(async(req,res,next)=>{
    const {email}=req.user;
    const adminUser = await User.findOne({email});
    if(adminUser.role !=="admin"){
        throw new Error("You are not an admin")
    }else{
        next();
    }
});

module.exports={authMiddleware,isAdmin};

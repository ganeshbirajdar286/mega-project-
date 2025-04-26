import { ApiError } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asynHandler.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";

export  const  VerifyJWT =asyncHandler(async(req,_,next)=>{
   try {
     const token= req.cookies.accessToken 
     if(!token){
         throw new ApiError(401,"unauthorized user")
     }
     const  decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
     
    const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
      if(!user){
         throw new ApiError(401,'Invalid user Token')
      }
    req.user=user
    next()
   } catch (error) {
      throw new ApiError(401,error?.message || "Invaild access token ")
   }


})
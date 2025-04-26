import {asyncHandler} from "../utils/asynHandler.js";
import {ApiError} from "../utils/APIerror.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/APIresponse.js";
import fs from "fs"
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens= async(userId)=>{
   try {
      const user= await User.findById(userId);
       const accessToken=user.generateAccessToken()
       const refreshToken=user.generateRfereshToken()
       user.refreshToken = refreshToken;
       await user.save({ validateBeforeSave: false });
        return {accessToken,refreshToken}
   } catch (error) {
       throw new ApiError(500,"something went wrong while generating referesh and access token")
   }
}

const registerUser= asyncHandler(async(req,res)=>{
    // get user details from frontend
   // validation - not empty
   // check if user already exists: username, email
   // check for images, check for avatar
   // upload them to cloudinary, avatar
   // create user object - create entry in db
   // remove password and refresh token field from response
   // check for user creation
   // return res


   const {fullName,email,password,username}=req.body;
   if([fullName,email,password,username].some((filed)=>filed?.trim()==="")){
      throw new ApiError(400,"All fields are required")
   }
   const existedUser= await User.findOne({
      $or:[{username},{email}]
   })
   
   const avatarLocalPath = req.files?.avatar[0]?.path;
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
      coverImageLocalPath =req.files.coverImage[0].path;    
}

   if(!avatarLocalPath){
      throw new ApiError(400,"avatar is required")
   }
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage =await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
   throw new ApiError(400,"avatar is required")
  }

  if(existedUser){
   fs.unlinkSync(avatarLocalPath)
   fs.unlinkSync(coverImageLocalPath)
   throw new ApiError(409," user with username or email already exits")
}


 const user=await User.create({
   fullName,
   avatar:avatar.url,
   coverImage:coverImage?.url || "",
   email,
   password,
   username:username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

if(!createdUser){
     throw new ApiError(500,"something went wrong while  registering the user")
}
     return res.status(201).json(
      new ApiResponse(200,createdUser,"user successfully register")
     )

})

const loginUser = asyncHandler(async(req,res)=>{
   const {email,username,password}=req.body 
   if(!email && !username){
      throw new ApiError(400,"username or email is required")
   }
   const user=await User.findOne({
      $or:[{email},{username}]
   })
   if(!user){
      throw new ApiError(400,"user does not exist")
   }
   
   const isPasswordValid =await user.isPasswordCorrect(password)
   if(!isPasswordValid){
      throw new ApiError(401,"Invalid user Credentials")
   }
   const  { accessToken , refreshToken } = await generateAccessAndRefereshTokens(user._id)
  
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

   const options={
      httpOnly:true,
      secure:true,
   }

   return res.status(200)
   .cookie('accessToken',accessToken,options)
   .cookie('refreshToken',refreshToken,options)
   .json(
     new ApiResponse(
      200,
      {
         user:loggedInUser,accessToken,refreshToken
      },
      "User logged in succesfully"
     )
   )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
   const incomingRefreshToken=req.cookies.refreshToken
   if(!incomingRefreshToken){
      throw new ApiError(401,"unauthorized request")
   }
 try {
    const decodeToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  
    const user = User.findById(decodeToken._id)
    if(!user){
     throw new ApiError(401,"invalid refresh token")
  }
  
  if(incomingRefreshToken !== user.refreshToken){
     throw new ApiError(401,"refresh token is expired or uses")
  }
  const options={
     httpOnly:true,
     secure:true,
  }
  const  { accessToken , newRefreshToken } = await generateAccessAndRefereshTokens(user._id)
  
  return res.status(200)
     .cookie('accessToken',accessToken,options)
     .cookie('refreshToken',newRefreshToken,options)
     .json(
       new ApiResponse(
        200,
        {
        accessToken,newRefreshToken
        },
        "access token refreshed"
       )
     )
 } catch (error) {
   throw new ApiError(401,error?.message || "Invalid refresh token")
 }
})


const logOutUser = asyncHandler(async(req,res)=>{
     await User.findByIdAndUpdate(
      req.user,{
         $set:{
            refreshToken:undefined
         }
      },
      {
         new:true   // new: true: returns the updated document after the update.
      }
    )

    const options={
      httpOnly:true,
      secure:true,
   }
     return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(
      new ApiResponse(
         200,
         {},
         "user logout successfully"
      )
     )
})
export {registerUser,loginUser,logOutUser,refreshAccessToken}
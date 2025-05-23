import {asyncHandler} from "../utils/asynHandler.js";
import {ApiError} from "../utils/APIerror.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/APIresponse.js";
import fs from "fs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";



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


const changeCurrentPassword=asyncHandler(async(req,res)=>{
   const {oldPassword,newPassword}=req.body;
   const user= await User.findById(req.user._id);
   const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
   if(!isPasswordCorrect){
      throw new ApiError(400,"password is invalid")
   }
   user.password=newPassword
   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(new ApiResponse(200,{},"password change successfully"))
})


const getCurrentUser = asyncHandler(async(req,res)=>{
   return res
      .status(200)
      .json(
         new ApiResponse(200,req.user,"user fetched successfully")
      )
})

const updatedUserDetails=asyncHandler(async(req,res)=>{
      const {fullName,email}=req.body;
      if(!fullName || !email){
         throw new ApiError(400,"All fields required")
      }

      const user =await  User.findByIdAndUpdate(req.user?._id,{
            $set:{
               fullName,
               email
            }
      },
      {new:true}
   ).select("-password")

   return res
   .status(200)
   .json(
      new ApiResponse(200,user,"Account  details  are updated  ")
   )
})

const avatarUpdate=asyncHandler(async(req,res)=>{
   const avatarLocalPath =req.file?.path
   if(!avatarLocalPath){
      throw new ApiError(400,"avatar  is  not upload")
   }
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   if(!avatar.url){
      throw new ApiError(500 ," avatar url not present ")
   }

   const user =await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            avatar:avatar.url,
         }
      },
      {
         new:true
      }
   ).select("-password")

   return res
   .status(200)
   .json(
      new ApiResponse(
         200,user,"updated avatar url"
      )
   )
})

const coverImageUpdate=asyncHandler(async(req,res)=>{
   const coverLocalPath =req.file?.path
   if(!coverLocalPath){
      throw new ApiError(400,"coverImage is  not upload")
   }
   const coverImage = await uploadOnCloudinary(coverLocalPath)
   if(!coverImage.url){
      throw new ApiError(500 ," coverImage url not present ")
   }

   const user =await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            coverImage:coverImage.url,
         }
      },
      {
         new:true
      }
   ).select("-password")

   return res
   .status(200)
   .json(
      new ApiResponse(
         200,user,"updated coverImage url"
      )
   )
})


//  aggregation pipelines 
const getUserChannelProfile =asyncHandler(async(req,res)=>{
  const {username} = req.params
  if(!username?.trim()){
   throw new ApiError(400,"username is missing ")
  }
  const channel= await User.aggregate([
   {
      $match:{
         username:username?.toLowerCase()
      }
   },
   // calculate subcribers
   {
      $lookup:{
         from:"subcriptions",
         localField:"_id",
         foreignField:"channel",
         as:"subscribers"
      }
   },
   //calculate channels
   {
      $lookup:{
         from:"subcriptions",
         localField:"_id",
         foreignField:"subscribers",
         as:"subscribedTo"
      }
   },
   // to add filed in user model
   {
      $addFields:{
         subscribersCount:{
            $size:"$subscribers"
         },
         channelSubscribedToCount:{
            $size:"$subscribedTo"
         },
         isSubscribed:{
            $cond:{
               if:{$in:[req.user?._id,"$subscribers.subscriber"]},
               then:true,
               else:false
            }
         }
      }
   },
   {
      $project:{
         fullName:1,
         username:1,
         subscribersCount:1,
         channelSubscribedToCount:1,
         isSubscribed:1,
         avatar:1,
         coverImage:1,
         email:1,
      }
   }
]) 
if(!channel?.length){
  throw new ApiError(400,"channel doesnot exist ")
}
console.log(channel)

return res
.status(200)
.json(
   new ApiResponse(200,channel[0],"user channel fetched successfully")
)
})
//  aggregation pipelines  from watchHistory
const getWatchHistory = asyncHandler(async(req,res)=>{
    const user =await User.aggregate([
      {
         $match:{
            _id: new mongoose.Types.ObjectId(req.user._id)  // req.user._id return string not mongodb id this string goto mongoose and mongoose tell monogobd it's id.  but when aggregation take place this code directly go to mongodb not to mongoose.so that why we have to use  "mongoose.Types.ObjectId(req.user._id)" .this tell  mongodb that this is mongodb id
         }
      },
      {
         $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
               {
                  $lookup:{
                     from:"users",
                     localField:"owner",
                     foreignField:"_id",
                     as:"owner",
                  pipeline:[
                     {
                        $project:{
                           fullName:1,
                           username:1,
                           avatar:1,
                        }
                     }
                  ]
               }
            },
               {
                  $addFields:{
                       owner:{
                        $arrayElemAt:["$owner",0]
                       }
                  }
               }
            ]
         }
      }


    ])
    return res
    .status(200)
    .json(
      new ApiResponse(200,
         user[0].watchHistory,
         "watch history fecthed  for user"
      )
    )
})
export {registerUser,
      loginUser,
      logOutUser,
      refreshAccessToken,
      getCurrentUser,
      changeCurrentPassword,
      updatedUserDetails,
      avatarUpdate,
      coverImageUpdate,
      getUserChannelProfile,
      getWatchHistory
   }
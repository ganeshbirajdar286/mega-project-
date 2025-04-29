import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import  {ApiError} from "../utils/APIerror.js"
import { ApiResponse } from "../utils/APIresponse.js";
import {asyncHandler} from "../utils/asynHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description} = req.body

   if(!title || !description){
      throw new ApiError(400,"Enter title or description")
   }
 const videoLocalFilePath=req.files?.videoFile[0]?.path;
 const thumbnailLocalFilePath=req.files?.thumbnail[0]?.path;


 const videoFile= await uploadOnCloudinary(videoLocalFilePath);
 const thumbnailFile = await uploadOnCloudinary(thumbnailLocalFilePath);
  
 if(!videoFile){
    throw new ApiError(400,"video is require")
 }
 if(!thumbnailFile){
    throw new ApiError(400,"thumbnail is require")
 }
  
  const video =await Video.create({
    videoFile:videoFile.url,
    thumbnail:thumbnailFile.url,
    title,
    description,
    duration:videoFile.duration,
    owner:req.user?._id
 })

 if(!video){
    throw new ApiError(500,"something went wrong in uploading  video")
 }

 res
 .status(200)
 .json(
    new ApiResponse(200,
        video,
        "vedio successfully upload"
    )
 )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
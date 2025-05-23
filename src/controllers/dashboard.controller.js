import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import  {ApiError} from "../utils/APIerror.js"
import { ApiResponse } from "../utils/APIresponse.js";
import {asyncHandler} from "../utils/asynHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }
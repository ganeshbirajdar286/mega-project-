import  {ApiError} from "../utils/APIerror.js"
import { ApiResponse } from "../utils/APIresponse.js";
import {asyncHandler} from "../utils/asynHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
})

export {
    healthcheck
    }
    
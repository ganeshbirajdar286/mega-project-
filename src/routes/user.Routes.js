import { Router } from "express";
import { avatarUpdate, changeCurrentPassword, coverImageUpdate, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logOutUser, registerUser, updatedUserDetails } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import{ VerifyJWT} from "../middlewares/auth.middleware.js"
import {refreshAccessToken} from "../controllers/user.controller.js"
const router = Router()

router.route("/register").post(
     upload.fields([
        {
            name:"avatar", 
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1  
        }
     ]),
    registerUser)

router.route("/login").post(
loginUser
)

router.route('/logout').post(VerifyJWT,logOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(VerifyJWT,changeCurrentPassword)
router.route("/current-user").get(VerifyJWT,getCurrentUser)
router.route("/updated-account").patch(VerifyJWT,updatedUserDetails) // update is taken place that why we use patch instayed of post.if we use post it update whole model
router.route("/avatar").patch(VerifyJWT,upload.single("avatar"),avatarUpdate)
router.route("/cover-image").patch(VerifyJWT,upload.single("coverImage"),coverImageUpdate)
router.route("/c/:username").get(VerifyJWT, getUserChannelProfile)
router.route("/history").get(VerifyJWT, getWatchHistory)


export default router 
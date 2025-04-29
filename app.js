import express from  "express";
import cors from "cors"
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser"
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app =express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"})) // limits json to 16kbytes 

 app.use(express.urlencoded({extended:true,limit:"16kb"}))//  base no url when we search google the url which goolge show https://www.google.com/search?gs_ssp=eJzj4tLP1TcoqiwoyE1XYDRgdGDwYkvPLMkoTQIAWC4HFA&q=github&oq=git&gs_lcrp=EgZjaHJvbWUqEggCEC4YJxjHARjRAxiABBiKBTIGCAAQRRg7Mg4IARBFGDsYQxiABBiKBTISCAIQLhgnGMcBGNEDGIAEGIoFMhQIAxBFGDkYQxiDARixAxiABBiKBTIPCAQQABhDGLEDGIAEGIoFMg8IBRAAGEMYsQMYgAQYigUyDwgGEAAYQxiLAxiABBiKBTIPCAcQABhDGIsDGIAEGIoFMhIICBAAGEMYiwMYsQMYgAQYigUyBwgJEAAYjwLSAQk0MDg4ajFqMTWoAgiwAgHxBekYGSOkwW5i&sourceid=chrome&ie=UTF-8

 app.use(express.static(path.join(__dirname,"public")))
 app.use(cookieParser())  //To read and manipulate cookies in Express applications.
  

 
 
 //routes import
 import userRouter from "./src/routes/user.Routes.js"
import tweetRouter from "./src/routes/tweet.Routes.js"
import subscriptionRouter from "./src/routes/subscription.Routes.js"
import videoRouter from "./src/routes/video.Routes.js"
import commentRouter from "./src/routes/comment.Routes.js"
import likeRouter from "./src/routes/like.Routes.js"
import playlistRouter from "./src/routes/playlist.Routes.js"
import dashboardRouter from "./src/routes/dashboard.Routes.js"
import healthcheckRouter from "./src/routes/healthcheck.Routes.js"

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users",userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)
export {app}  
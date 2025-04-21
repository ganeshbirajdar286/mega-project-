import express from  "express";
import cors from "cors"
import cookieParser from "cookie-parser"
const app =express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"})) // limits json to 16kbytes 

 app.use(express.urlencoded({extended:true,limit:"16kb"}))//  base no url when we search google the url which goolge show https://www.google.com/search?gs_ssp=eJzj4tLP1TcoqiwoyE1XYDRgdGDwYkvPLMkoTQIAWC4HFA&q=github&oq=git&gs_lcrp=EgZjaHJvbWUqEggCEC4YJxjHARjRAxiABBiKBTIGCAAQRRg7Mg4IARBFGDsYQxiABBiKBTISCAIQLhgnGMcBGNEDGIAEGIoFMhQIAxBFGDkYQxiDARixAxiABBiKBTIPCAQQABhDGLEDGIAEGIoFMg8IBRAAGEMYsQMYgAQYigUyDwgGEAAYQxiLAxiABBiKBTIPCAcQABhDGIsDGIAEGIoFMhIICBAAGEMYiwMYsQMYgAQYigUyBwgJEAAYjwLSAQk0MDg4ajFqMTWoAgiwAgHxBekYGSOkwW5i&sourceid=chrome&ie=UTF-8

 app.use(express.static("public"))
 app.use(cookieParser())  //To read and manipulate cookies in Express applications.
 
export {app}
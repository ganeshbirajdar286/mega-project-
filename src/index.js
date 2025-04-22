import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "../app.js";
dotenv.config({
    path:"./env"
})
connectDB() 
.then(()=>{
    app.listen(process.env.PORT || 8001,()=>{
        console.log(`server is running at port :${process.env.PORT}`);
        
    }) 
}) 
.catch((error)=>{
    console.log("MONGODB CONNECTION FAILED !!! ",error)
    process.exit(1)
}) 

 





// first method 
// (async ()=>{
//   try {
//    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)  // USE TO CONNECT DATABASE  
//        app.on("error",(error)=>{
//         console.log("ERRR:",error)
//         throw error
//        })

//      app.listen(process.env.PORT,()=>{
//         console.log(`App is listening on PORT ${process.env.PORT}`);
        
//      })
//   } catch (error) {
//     console.error("ERROR: ",error)
//     throw err
//   }
// })()
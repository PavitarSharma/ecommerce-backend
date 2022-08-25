import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import cloudinary from "cloudinary";

import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import productsRoutes from "./routes/productsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import whishListRoutes from "./routes/wishListRoutes.js";

const app = express();
dotenv.config();


const PORT = process.env.PORT || 8000;

// mongodb connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Database connection successfully..'))
    .catch(error => console.log('Database connection error!', error.message));


// cloudinary configuration 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
// middlewares
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }))
app.use(fileUpload())

// routes middlewares
app.use("/api/v2", productsRoutes);

app.use("/api/v2", userRoutes);

app.use("/api/v2", orderRoutes);

app.use("/api/v2", whishListRoutes); // cart

//app.use(express.static(path.join(__dirname,"../frontend/build")));

// app.get("*",(req,res) =>{
//     res.sendFile(path.resolve(__dirname,"../frontend/build/index.html"));
// })

app.listen(PORT, () => console.log(`Server listening in port ${PORT}...`));
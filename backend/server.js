import express from "express"
import { connectDB } from "./DB/db.js";
import cors from "cors"
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";


const app = express();
const PORT = process.env.PORT || 3000;
connectDB();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use("/api/v1/users" , userRouter)


app.get("/" , (req,res) => {
    res.send("Working");
})


app.listen(PORT , ()=>{
    console.log(`server is running in port : ${PORT}`)
})
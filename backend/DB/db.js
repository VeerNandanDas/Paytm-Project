import mongoose from "mongoose"
import dotenv from "dotenv";


dotenv.config();
const DB_URL = process.env.DB_URL

if(!DB_URL) {
    throw new Error("DB URL IS missing")
}

export const connectDB = async () => {

    try {
        await mongoose.connect(DB_URL)
        console.log("Connected to the DB")
    } catch (error) {
        console.log("Error while conecting to the DB")
    }

}
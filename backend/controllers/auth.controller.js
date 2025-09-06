import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { loginSchema, registerSchema } from "../models/auth.model.js"

export const registerUser = async(req,res) => {
    try {
        const data = registerSchema.parse(req.body);
        const { name, email, password } = data;

        if (!data) {
            return res.status(400).json({ msg: "Failed to process data" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ msg: "User already exists" }); // fixed typo

        const newUser = new User(data); // create instance

        const token = jwt.sign(
            {
                _id: newUser._id,
                email: newUser.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY || "1d"
            }
        );

        newUser.verificationToken = token;
        await newUser.save(); // save to DB
        console.log(newUser);
        res.status(200).json({ msg: "signup complete" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }

}


export const loginUser = async(req,res)=>{
   try {
     const data = loginSchema.parse(req.body);
    
     if(!data) {
             return res.status(400).json({ msg : "Failed to process data"})
     };
 
     const user = await User.findOne({email : data.email});
     if(!user) return res.status(400).json({ msg : "Invalid Email"});
 
     const isMatch = await bcrypt.compare(data.password, user.password);
     if (!isMatch) return res.status(400).json({ msg : "Invalid password"});
 
     const token = jwt.sign({ id : user._id } , process.env.JWT_SECRET , { expiresIn : "5h"});
 
     res.cookie("TOKEN" ,token, {
         httpOnly:true,
         maxAge: 24 * 60 * 60 * 1000,
     })

      res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
    }});
 
   } catch (error) {
    res.status(400).json({ msg: error.message });
   }
}




export const deleteUser = async (req,res) => {
   try {
     const { email , password } = req.body;
 
     const user = await User.findOne({email});
     if(!user) return res.status(400).json({ msg : "User doesnt exists"});
 
     const isMatch = await bcrypt.compare(password,user.password);
     if(!isMatch) return res.status(400).json({ msg : "Wrong password"});
    
     await User.deleteOne({ email });
 
     res.status(200).json({msg: "User deleted Succesfully"})
   } catch (error) {
        return res.status(400).json({ msg: "Delete"})
   }


}
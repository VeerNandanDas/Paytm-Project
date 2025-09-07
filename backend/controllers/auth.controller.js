import mongoose from "mongoose"
import {  User } from "../models/user.model.js"
import { Account } from "../models/account.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { loginSchema, registerSchema } from "../models/auth.model.js"
import { email, success } from "zod"




export const registerUser = async(req,res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();


        const data = registerSchema.parse(req.body);
        const { name, email, password } = data;

        if (!data) {
            return res.status(400).json({ msg: "Failed to process data" });
        }

        const userExists = await User.findOne({ email }).session(session);
        if (userExists) return res.status(400).json({ msg: "User already exists" }); // fixed typo

        const newUser = new User(data); 

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

        await newUser.save({ session });

        const newAccount = new Account({
            userID: newUser._id,
           balance: Math.floor(1 + Math.random()*1000),
        })
        await newAccount.save({ session });

        
        newUser.account = newAccount._id;
        await newUser.save({ session });

        

        await session.commitTransaction();

        console.log("✅ User registered successfully:", {
            userId: newUser._id,
            email: newUser.email,
            accountId: newAccount._id,
            balance: newAccount.balance
        });


        res.cookie('token', token, {
            httpOnly: true, // prevents JavaScript access
            secure: process.env.NODE_ENV === 'production', // only send over HTTPS in production
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'strict' // prevents CSRF
        });


        
        res.status(201).json({ 
            success: true,
            message: "Registration successful",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                accountId: newAccount._id,
                balance: newAccount.balance
            }
        });


    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ msg: error.message });
    }

}


export const loginUser = async(req,res)=>{
   try {
     const data = loginSchema.parse(req.body);

     if(!data) {
         return res.status(400).json({ msg : "Failed to process data"})
     };
     
     const user = await User.findOne({email : data.email}).select("+password");
     if(!user) return res.status(400).json({ msg : "Invalid Email"});



     const isMatch = await bcrypt.compare(data.password, user.password);
     if (!isMatch) return res.status(400).json({ msg : "Invalid password" });
 
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

export const UpdateUser = async (req,res) => {

try {
        const { email , name , password } = req.body;
        let user;

        if(req.user){
            user = await User.findById(req.user.id);
        }
        
        if(email){
            user = await User.findOne({email});
        }
        
        if(!user) return res.status(400).json({ msg : "User not found"});
    
        if(name){
            user.name = name;
        }
    
        if(password){
            user.password = await bcrypt.hash(password,10);
        }
    
        await user.save();
    
        res.status(200).json({
            success:true,
            message : "Updated succesfully",
            user : {
                id : user._id,
                name : user.name,
                email : user.email
            }
        })
    
} catch (error) {
    console.log("error while updating  " , error.message);
    res.status(500).json({ success : false , message : "server error"})
}

}


export const findUser = async (req, res) => {
  try {
    const filter = req.query.filter || "";

    // Find all users with regex on name
    const users = await User.find({
      name: { $regex: filter, $options: "i" } // "i" = case insensitive
    }).select("name _id"); // only return name and _id

    res.json({
      success: true,
      users: users.map(user => ({
        name: user.name,
        _id: user._id
      }))
    });
  } catch (error) {
    console.error("Error finding users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

import { success } from "zod";
import { Account } from "../models/user.model.js"
import mongoose from "mongoose"

export const getBalance = async (req,res) => {



   try {
    console.log("Decoded" , req.user);

    const account = await Account.findOne({ 
          userID: new mongoose.Types.ObjectId(req.user.id) 
   });

 
     if(!account) return res.status(400).json({ msg : "Account doesnt exists"});
 
     res.status(200).json({
        success : true,
        data : { balance : account.balance}
     })
     
   } catch (error) {
        console.log("Error while fetching balance",error.message)
   }

};
import { success } from "zod";
import { Account } from "../models/user.model.js"
import mongoose from "mongoose"

export const getBalance = async (req, res) => {
   try {
      console.log("Decoded", req.user);
      
      const userId = req.user.id || req.user._id;
      
      console.log("req.user._id:", req.user._id);

      if (!userId) {
         return res.status(400).json({ 
            success: false, 
            msg: "Invalid token - no user ID found" 
         });
      }

     
      let account = await Account.findOne({ 
         userID: new mongoose.Types.ObjectId(userId) 
      });

    
      if (!account) {
         console.log("No account found, creating one for existing user");
         
         account = new Account({
            userID: new mongoose.Types.ObjectId(userId),
            balance: 0
         });
         
         await account.save();
         console.log("New account created:", account);
      }

      res.status(200).json({
         success: true,
         data: { balance: account.balance }
      });
      
   } catch (error) {
      console.log("Error while fetching balance:", error.message);
      res.status(500).json({ 
         success: false, 
         msg: "Internal server error",
         error: error.message 
      });
   }
};


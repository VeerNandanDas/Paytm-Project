import { success } from "zod";
import { Account } from "../models/account.model.js"
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
            balance: 1 + Math.random()*1000,
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


export const MoneyTransfer = async(req,res) => {

  try {
      //starts the session 
      const session = await mongoose.startSession();
      session.startTransaction();
  
      //get the data
      const { amount , to} = req.body;
  
      //find the account 
      const account = await Account.findOne({ userId : req.userId}).session(session);
      console.log(account);
  
      if( !account || amount > account.balance){
          await session.abortTransaction();
          res.status(400).json({
              success : false,
              msg : "Low Balance or Account doesnt exist",
          })
      }
  
      //find receiver account 
      const receiver = await mongoose.findOne({ userId : to}).session(session);
  
      if(!receiver){
          await session.abortTransaction();
          res.status(400).json({
              success:false,
              msg : "receiver doesnt exists",
          })
      }
      
      //perform the transcation
      await Account.updateOne({ userId : req.userId},{ $inc : { balance : -account }}).session(session);
      await Account.updateOne({ userId : to} , {$inc : {balance : amount }}).session(session);
  
  
  
      //commit the transcation
      await session.commitTransaction();
      res.json({
          message : "Transfer successfully",
      })
  
  } catch (error) {
    console.log("error is : " , error.message)
  }
;}
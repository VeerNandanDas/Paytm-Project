import { success } from "zod";
import { Account } from "../models/account.model.js"
import mongoose from "mongoose"
import { User } from "../models/user.model.js";

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

        //starts the session 
        const session = await mongoose.startSession();


    try {
            session.startTransaction();
            //get the dta from request body
            const { amount , to} = req.body;
        
            //validation of data 
            if( !amount || !to){
                await session.abortTransaction();
                return res.status(400).json({
                    succes : false,
                    msg : "Amount and id is needed",
                })
            }
        
            //validation of amount nature (- or +)
        
            if(amount <= 0){
                await session.abortTransaction();
                return res.status(400).json({
                    success : false,
                    msg : 'Amount has to be Positive or Non Zero',
                })
            }
        
        
            //get senders id from token 
        
            const senderId =  req.user.id || req.user._id;
        
            //validate senders id
            if(!senderId) return res.status(400).json({
                success : false ,
                msg : "SenderId not found",
            })
        
            //check if he is sendinf to himself
            if(senderId.toString() === to.toString()){
                await session.abortTransaction();
                return res.status(400).json({
                success : false,
                msg : 'You cannot send to yourself',
                })
            }
        
            //get senders account 
        
            const senderAccount = await Account.findOne({
                userID : new mongoose.Types.ObjectId(senderId)
            }).session(session)
        
        
            console.log("Sender account:", senderAccount);
        
        
            //validate
            if (!senderAccount) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    msg: "Sender account not found",
                });
            }
        
            //check amount he have in account
            if(amount > senderAccount.balance){
                await session.abortTransaction();
                return res.status(400).json({
                    success : false,
                    msg : "insufficient Balance"
                })
            }

                    
        
            //find receivers account
        
            const receiverAccount = await Account.findOne({
                userID:  new mongoose.Types.ObjectId(to)
            }).session(session);
        
            //validate
            if (!receiverAccount){
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    msg: "Receiver  not found",
                });
            };
        
            //get sender and receiver name for log
            const senderUser = await User.findById(senderId).select('name email').session(session);
            const receiverUser = await User.findById(to).select('name email').session(session);
        
            //perform transcation
            await Account.updateOne(
                { userID: new mongoose.Types.ObjectId(senderId) }, 
                { $inc: { balance: -amount } }
            ).session(session);
        
        
        
            await Account.updateOne(
                { userID: new mongoose.Types.ObjectId(to) }, 
                { $inc: { balance: amount } }
            ).session(session);
            //commit session
        
            await session.commitTransaction();
            //response 
            res.status(200).json({
                success: true,
                message: "Transfer completed successfully",
                transfer: {
                    from: {
                        id: senderId,
                        name: senderUser.name,
                        newBalance: senderAccount.balance - amount
                    },
                    to: {
                        id: to,
                        name: receiverUser.name,
                        newBalance: receiverAccount.balance + amount
                    },
                    amount: amount,
                    timestamp: new Date()
                }
            });
    } catch (error) {
        await session.abortTransaction();
        console.log("❌ Transfer failed:", error.message);
        res.status(500).json({
            success: false,
            message: "Transfer failed",
            error: error.message
        });
    } finally {
        session.endSession();
    }
    };



  

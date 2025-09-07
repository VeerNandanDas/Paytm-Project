// backend/models/account.model.js
import mongoose from "mongoose"

export const accountSchema = new mongoose.Schema({
  userID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
    unique: true, 
    index: true   
  },
  balance: { 
    type: Number, 
    default: 100,
    min: [0, "Balance cannot be negative"],
    set: v => Math.round(v * 100) / 100 // Round to 2 decimal places
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction"
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt
});

export const Account = mongoose.model("Account", accountSchema);
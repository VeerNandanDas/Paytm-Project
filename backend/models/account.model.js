import mongoose from "mongoose"


export const accountSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  balance: { type: Number, default: 0 },
});

export const Account = mongoose.model("Account",accountSchema);
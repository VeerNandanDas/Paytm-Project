import Router from "express";
import { Account } from "../models/account.model.js"
import { checkAuth } from "../middlewares/auth.middleware.js";
import { getBalance, MoneyTransfer } from "../controllers/account.controller.js";


 const accountRouter = Router();

accountRouter.get("/balance-check" , checkAuth , getBalance);
accountRouter.post("/transcation" , checkAuth , MoneyTransfer );

export default accountRouter;
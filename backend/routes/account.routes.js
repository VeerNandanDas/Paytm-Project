import Router from "express";
import { Account } from "../models/user.model.js"
import { checkAuth } from "../middlewares/auth.middleware.js";
import { getBalance } from "../controllers/account.controller.js";


 const accountRouter = Router();

accountRouter.get("/balance-check" , checkAuth , getBalance);

export default accountRouter;
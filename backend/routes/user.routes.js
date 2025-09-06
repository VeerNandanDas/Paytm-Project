import { Router } from "express";
import { deleteUser, loginUser, registerUser } from "../controllers/auth.controller.js";
import { checkAuth } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post('/signup' , registerUser )
userRouter.post('/login' , checkAuth ,loginUser )
userRouter.delete('/delete-id' , checkAuth , deleteUser)


export default userRouter;
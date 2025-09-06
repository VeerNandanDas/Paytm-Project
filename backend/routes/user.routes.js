import { Router } from "express";
import { deleteUser, loginUser, registerUser } from "../controllers/auth.controller.js";

const userRouter = Router();

userRouter.post('/signup' , registerUser )
userRouter.post('/login' , loginUser )
userRouter.delete('/delete-id' , deleteUser)

export default userRouter;
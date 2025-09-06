import { Router } from "express";
import { deleteUser, findUser, loginUser, registerUser, UpdateUser } from "../controllers/auth.controller.js";
import { checkAuth } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post('/signup' , registerUser )
userRouter.post('/login'  ,loginUser )
userRouter.delete('/delete-id' , checkAuth , deleteUser)
userRouter.put('/update' ,checkAuth , UpdateUser )
userRouter.get('/find' ,checkAuth , findUser )


export default userRouter;
import { Router } from "express";
import { deleteAccount, login,  logout, signup } from "../controllers/user.controller.js";
import {verifyJWT} from '../middleware/auth.middleware.js'
import { googleLogin } from "../controllers/googleAuth.controller.js";
const userRouter = Router();

userRouter.route('/signup').post(signup)
userRouter.route('/login').post(login)
userRouter.route('/logout').post(verifyJWT,logout)
userRouter.route('/google').post(googleLogin)
userRouter.route('/delete-account').post(verifyJWT,deleteAccount)

export {userRouter}
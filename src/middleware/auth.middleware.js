import jwt from 'jsonwebtoken'
import asyncHandlerFunction from "../utils/asyncHandler.js";
import ApiError from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/apiResponse.js';
import {ADMIN, STUDENT, TEACHER} from '../constants.js'
const verifyJWT = asyncHandlerFunction(async (req, res, next) => {
    try {
      let token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
     console.log(token)      

      if (!token) {
        throw new ApiError(401, "Invalid Token");
      }
  
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken._id).select("-password -refreshToken");
  
      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }
  
      req.user = user;
  
      next();
    } catch (error) {
      console.error("Unauthorized access:", error);
      return res.status(error.statusCode || 401).json({ error: error.message });
    }
  });
  
const isTeacher = asyncHandlerFunction(async(req,res,next)=>{
  const user = req.user;

  if(user.role!==TEACHER){
   throw new ApiError(401,"unathorised access")
  }
  next()
})

const isAdmin = asyncHandlerFunction(async(req,res,next)=>{
  const user = req.user;

  if(user.role!==ADMIN){
    throw new ApiError(401,"unathorised access")
  
  }
 next()
})

const isStudent = asyncHandlerFunction(async(req,res,next)=>{
  const user = req.user;

  if(user.role!==STUDENT){
    throw new ApiError(401,"unathorised access")
  
  }
 next()
})


export {verifyJWT,isTeacher,isAdmin,isStudent}
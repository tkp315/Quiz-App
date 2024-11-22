/*
1.required: add grade
2.optionally add pictures
3. total_quizes: if had any then otherwise 0;
4. reports : if had any then otherwise NO REPORTS AT;
5. add bio, interesets and also add the userID 

all this in one handler

2. get details

 */


import { Profile } from "../models/profile.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandlerFunction from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createProfile = asyncHandlerFunction(async(req,res)=>{

const standardObj = Object.assign({},req.body)
const user  = req.user;
console.log(user)
console.log(standardObj)
const pictureLocalStorage = await req.file?.path;
console.log(pictureLocalStorage)
let picture= null
if(pictureLocalStorage)
{
    picture = await uploadOnCloudinary(pictureLocalStorage,process.env.FOLDER)
}

const profile = await Profile.findByIdAndUpdate(user.profile,{
    $set:{
        grade:standardObj.grade||null,
        picture:picture?.secure_url||null,
        bio:standardObj.bio||null
    }
},{new:true})



return res
.status(200)
.json(new ApiResponse(200,profile,"Successfully created quiz"))
})

export const getDetails = asyncHandlerFunction(async(req,res)=>{
    const user = req.user;

    const profile = await Profile.findById(user.profile)
    .populate('reports',{
        populate:{
            path:"quizId"
        }
    })
    .populate('createdQuizes')
    .populate('user')


    return res
    .status(200)
    .json(new ApiResponse(200,profile,"Successfully fetched Profile",true))
})

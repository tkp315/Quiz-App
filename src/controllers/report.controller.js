/*
1. get all reports for userId
3. overall performance
 */

import asyncHandlerFunction from '../utils/asyncHandler.js'
import {Report} from '../models/report.model.js'
import { ApiResponse } from '../utils/apiResponse.js';


export const reports = asyncHandlerFunction(async(req,res)=>{
    const user = req.user;

    const reports = await Report.find({userId:user._id}).populate('quizId');

    return res.status(200)
    .json(new ApiResponse(200,reports,"Generated all the reports"));

})


/*
1.create q
2. get all the q
 */
import fs from 'fs'
import { Question } from "../models/question.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandlerFunction from "../utils/asyncHandler.js";
import csvParser from 'csv-parser';
import { STUDENT } from '../constants.js';


export const createQuestion = asyncHandlerFunction(async(req,res)=>{
    const {question,options,correct_ans,difficulty,marks,tags} =req.body;
    const{user}=req;
    console.log(req.body)
    if(!question||!correct_ans||!difficulty||
    !marks) {
        throw new ApiError(401,"Something are missing")
    }

    const optionArray = Array.isArray(options)?options:JSON.parse(options);

    const tagsArray = Array.isArray(tags)?tags:JSON.parse(tags);

    const newquestion = await Question.create({
        question,
        options:optionArray,
        correct_ans,
        difficulty,
        marks,
        tags:tagsArray,
        createdBy:user._id

    })

    return res.status(200)
    .json(new ApiResponse(200,{newquestion},"New Question is added"))
})

export const importQuestions = asyncHandlerFunction(async (req, res) => {
    const csvFile = req.file;
  
    if (!csvFile) {
      throw new ApiError(404, "CSV file not found");
    }
  
    const results = [];
  
    try {
      const readStream = fs.createReadStream(csvFile.path)
        .pipe(csvParser())
        .on("data", (data) => {
          // Parsing and validating each row
          console.log(data)
          const question = {
            question: data.question?.trim(),
            options: data.options?.split(",").map((option) => option.trim()),
            correct_ans: data.correct_ans?.trim(),
            difficulty: data.difficulty?.trim(),
            marks: Number(data.marks), // Convert marks to number
            tags: data.tags?.split(",").map((tag) => tag.trim()),
            createdAt: new Date(data.createdAt), 
            createdBy:data.createdBy// Convert to valid Date
          };
  
          // Optional: Add validation for mandatory fields
          if (
            !question.question ||
            !question.options ||
            !question.correct_ans ||
            !question.difficulty ||
            !question.marks
          ) {
            console.error(`Invalid data row: ${JSON.stringify(data)}`);
          } else {
            results.push(question);
          }
        })
        .on("end", async () => {
          if (results.length === 0) {
            throw new ApiError(400, "No valid questions found in the CSV file");
          }
  
          // Insert questions into the database
          await Question.insertMany(results);
  
          return res
            .status(200)
            .json(new ApiResponse(200, results, "Questions imported successfully"));
        });
    } catch (error) {
      console.error(error);
      throw new ApiError(500, "An error occurred while importing questions");
    }
  });
  
export const getAllQuestions = asyncHandlerFunction(async(req,res)=>{
    const {user}=req;

    if(user.role!==STUDENT){
        throw new ApiError(400,"Invalid User")
    }

    const questions = await Question.find({});

    return res.status(200)
    .json(new ApiResponse(200,questions,"Successfully got questions"));
})

export const myQuestion = asyncHandlerFunction(async(req,res)=>{
 const {user} = req;

 const questions = await Question.find({createdBy:user._id});
 if(questions.length===0){
  throw new ApiError(401,"You had not created any question");
 }
 console.log(questions,"Questions fetched by m e ")
  return res.status(200)
  .json(new ApiResponse(200,{questions},"Fetched my-created-questions"));
})
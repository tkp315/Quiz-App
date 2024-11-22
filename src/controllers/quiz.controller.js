/*
1.create quiz ******Admin****
2.get total_students 
3.open quiz 
4.auto submit after duration
5.submiting logic
6.canceling logic
 */

import { Profile } from "../models/profile.model.js";
import { Question } from "../models/question.model.js";
import { Quiz } from "../models/quiz.model.js";
import { Report } from "../models/report.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandlerFunction from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createQuiz = asyncHandlerFunction(async (req, res) => {
  const { questions, title, duration, instructions, isNegativeMarking ,negMark} =
    req.body;
  const user = req.user;
  console.log(req.body)
  if(!title)throw new ApiError(401, "Title is required");
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(401, "Question Array is required");
  }
  
  const instructionsArray  = instructions.split(',').map((e)=>e.trim());


  if ([title, isNegativeMarking, duration].some((e) => e === "")) {
    throw new ApiError(
      404,
      "please enter title or isNegativeMarking, or duration"
    );
  }

  const newquiz = await Quiz.create({
    title,
    questions,
    duration,
    isNegativeMarking,
    instructions:instructionsArray,
    quizSetter: user._id,
    negativeMarkingSystem:negMark?negMark:""  });

//   for(const que of questions){
//     const question = await Question.findById(que);
//     if(!question){
//         throw new ApiError(404,"Question not found");
//     }
//     question.quizId= newquiz._id
//     await question.save()
//   }
  const quiz = await Quiz.findById(newquiz._id)
    .populate("questions")
    .populate("quizSetter");

    const profile = await Profile.findByIdAndUpdate(user.profile,{
        $push:{
            createdQuizes:quiz._id
        }
    },{new:true})
  return res
    .status(200)
    .json(new ApiResponse(200, quiz, "Successfully created a Quiz"));
});

export const onlyAddQuestion = asyncHandlerFunction(async (req, res) => {
  const { questions, quizId } = req.body;
  const user = req.user;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(401, "Question Array is not found or invalid ");
  }

  const quiz = await Quiz.findById(quizId);

  const questionArray = quiz.questions;
  if (questionArray.length === 0) {
    quiz.questions = questions;
  } else {
    for (let que of questions) {
      quiz.questions.push(que);
    }
  }
  await quiz.save();
//   for(const que of questions){
//     const question = await Question.findById(que);
//     if(!question){
//         throw new ApiError(404,"Question not found");
//     }
//     question.quizId= quizId
//     await question.save()
//   }

const profile = await Profile.findByIdAndUpdate(user.profile,{
    $push:{
        createdQuizes:quiz._id
    }
},{new:true})
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { questionArray: quiz.questions },
        "Successfully Added Questions",
        true
      )
    );
});

export const allQuizes = asyncHandlerFunction(async(req,res)=>{
//   only admin can see all this 
    const quizes = await Quiz.find({})
    .populate('questions')
  
    .populate('quizSetter')

    return res 
    .status(200)
    .json(new ApiResponse(200,quizes,"Get all quizzes",true))
})

export const  myQuizes = asyncHandlerFunction(async(req,res)=>{
    const {user} = req;
    const userId = user._id;

    const quizzes = await Quiz.find({quizSetter:userId})
    .populate("quizSetter").select('-password -refreshToken');

    if(quizzes.length===0){
        throw new ApiError('404',"No quizzes found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{quizzes},"Successfully Got Quizzes"))

})



export const submitQuiz = asyncHandlerFunction(async (req, res) => {
  const { timeRemaining, answersArray, quizId } = req.body;
  const user = req.user;

  // Ensure answersArray is an array
  if (!Array.isArray(answersArray)) {
    throw new ApiError(401, "Answers must be an array");
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  const { isNegativeMarking, negativeMarkingSystem, duration, questions } = quiz;
  let analysis = {};
  let skipped = 0;
  let correct = 0;
  let incorrect = 0;
  let score = 0;

  // Process each answer
  for (const que of answersArray) {
    const question = questions.find(q => q._id.toString() === que.id); 
    if (!question) {
      skipped++;
      continue;
    }
    const currQuestion = await Question.findById(que.id);
    if (!currQuestion) {
      skipped++;
      continue;
    }

    const marks = Number(currQuestion.marks);
    
    const answer = currQuestion.correct_ans;
    
    if (answer === que.ans) {
      correct++;
      score += marks; 
    } else {
      incorrect++;
      if(isNegativeMarking){
        if(negativeMarkingSystem<0){
          score += negativeMarkingSystem; 
        }
        else {
          score-=negativeMarkingSystem
        }
      }
      
   
    }

    que.correctAns = currQuestion.correct_ans;
    que.question = currQuestion.question;
  }

  // Ensure score does not go below 0


  // Calculate total possible marks
  let totalMarks = 0;
  const allQuestions = await Question.find({ _id: { $in: quiz.questions } });
  allQuestions.forEach((e) => {
    totalMarks += Number(e.marks);
  });

  let performance = (score / totalMarks) * 100;
  performance = performance.toFixed(2); // Ensure 2 decimal points

  let suggestion = "";

  // Performance Suggestions
  if (performance >= 75) {
    suggestion = "Your performance is exceptional!";
  } else if (performance >= 60) {
    suggestion = "Great effort! Keep striving for even greater success.";
  } else if (performance >= 45) {
    suggestion = "Good job! Keep building on your strengths.";
  } else if (performance >= 0) {
    suggestion = "Don't be discouraged; keep practicing!";
  } else {
    suggestion = "No suggestion available.";
  }

  // Prepare the analysis
  analysis = {
    correct,
    wrong: incorrect,
    skipped,
    score,
    completedIn: duration - timeRemaining,
    timeRemaining,
    totalAnswered: correct + incorrect,
    suggestion,
    totalMarks
  };

  // Save the report
  const newReport = await Report.create({
    quizId,
    userId: req.user._id,
    score: analysis.score === 0 ? 0 : analysis.score, // Ensure score is 0 or positive
    correctAnswers: analysis.correct,
    incorrectAnswers: analysis.wrong,
    totalAnswered: analysis.totalAnswered,
    skipped: analysis.skipped,
    suggestions: analysis.suggestion,
    completedIn: analysis.completedIn,
    timeRemaining: analysis.timeRemaining,
    myAnswers: answersArray,
    totalMarks
  });

  // Add report to user profile
  await Profile.findByIdAndUpdate(user.profile, {
    $push: { reports: newReport._id },
  });

  return res.status(200).json(new ApiResponse(200, { report: analysis }, "Successfully submitted the quiz", true));
});


export const quizImage = asyncHandlerFunction(async(req,res)=>{
  const user = req.user
  const quizId = req.body.quizId;
  

  const quiz = await Quiz.findById(quizId);

  if(!quiz){
    throw new ApiError(401,"Quiz not found");
  }

  const quizImageLocalPath = req.file?.path;

  const quizImage = await uploadOnCloudinary(quizImageLocalPath,process.env.FOLDER)

  quiz.quizImage=quizImage.secure_url;
  await quiz.save();

  return res.status(200)
  .json(new ApiResponse(200,quiz,"Successfully updated Image"));



})

export const quizById = asyncHandlerFunction(async(req,res)=>{
  const {user,body} = req;
  const {quizId} = body;
  console.log(quizId)

  const  quiz = await Quiz.findById(quizId)
  .populate("questions")
  .populate("quizSetter").select('-password -refreshToken');
   return res.status(200)
  .json(new ApiResponse(200,quiz,"Successfully Fetched Quiz"));
})
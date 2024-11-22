import { Router } from "express";
import { createQuestion, getAllQuestions, importQuestions, myQuestion } from "../controllers/question.controller.js";
import { isAdmin, isTeacher, verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const questionRouter = Router();

questionRouter.route('/create-question').post(verifyJWT,isTeacher,createQuestion)

questionRouter.route('/import-question').post(verifyJWT,isTeacher,upload.single('csvFile'),importQuestions)

questionRouter.route('/get-all-questions').post(verifyJWT,isAdmin,getAllQuestions)

questionRouter.route('/my-questions').post(verifyJWT,isTeacher,myQuestion)




export {questionRouter}
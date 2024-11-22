import { Router } from "express";
import { isAdmin, isTeacher, verifyJWT } from "../middleware/auth.middleware.js";
import { allQuizes, createQuiz, myQuizes, onlyAddQuestion, quizById, quizImage, submitQuiz } from "../controllers/quiz.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const quizRouter = Router();

quizRouter.route('/create-quiz').post(verifyJWT,isTeacher,createQuiz)

quizRouter.route('/update-quiz').post(verifyJWT,isTeacher,onlyAddQuestion)

quizRouter.route('/all-quizes').get(verifyJWT,allQuizes)

quizRouter.route('/my-quizes').post(verifyJWT,isTeacher,myQuizes)

quizRouter.route('/submit-quiz').post(verifyJWT,submitQuiz);

quizRouter.route('/quiz-image').post(verifyJWT,isTeacher,upload.single('quizImage'),quizImage)
quizRouter.route('/quiz-by-id').post(verifyJWT,quizById);

export {quizRouter}
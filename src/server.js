import app from "./app.js";
import dotenv from "dotenv";
import connectToDB from "./database/db.js";
import { Server } from "socket.io";
import { Quiz } from "./models/quiz.model.js";
import { EASY, HARD, MEDIUM } from "./constants.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 5000;
let currentQuiz ={};
connectToDB().then(()=>{
   const server =  app.listen(port, () => {
        console.log(`server listening on port ${port}`);
        try {
          const io = new Server (server,{
            cors:{
              origin:[process.env.ORIGIN],
              credentials:true
            }
          })

          io.on('connection',(socket)=>{
            console.log('user is connected with ',socket.id)

            socket.on('check-answers', ({ quiz, response, expiredQuestions: clientExpired }) => {
              console.log("currResponse", response);
              const myQuiz = quiz;
              let questionArray = myQuiz.questions;
              let expiredQuestions = [...(clientExpired || [])]; // Use expired questions from frontend
              console.log("Expired Questions from Client:", expiredQuestions);
          
              if (!response) return;
          
              const currQuestionIndex = questionArray.findIndex((e) => e._id.toString() === response.id);
              if (currQuestionIndex === -1) {
                  console.log("Current question not found");
                  return;
              }
          
              const currQuestion = questionArray[currQuestionIndex];
          
              // Remove currQuestion from questionArray
              questionArray.splice(currQuestionIndex, 1);
              console.log("Removed Current Question: ", currQuestion);
          
              const level = currQuestion.difficulty;
              const correctAnswer = currQuestion.correct_ans;
              const isCorrect = correctAnswer === response.ans;
          
              function getNextQuestion(targetLevel) {
                  const difficulties = [EASY, MEDIUM, HARD];
                  const targetIndex = difficulties.indexOf(targetLevel);
          
                  for (let i = targetIndex; i < difficulties.length; i++) {
                      let questionSet = questionArray.filter((q) => q.difficulty === difficulties[i]);
          
                      if (questionSet.length === 0 && expiredQuestions.length < questionArray.length) {
                          questionSet = questionArray; // Use all questions as fallback
                      }
          
                      let availableQuestions = questionSet.filter((q) => {
                          return (
                              !expiredQuestions.includes(q._id.toString()) 
                          );
                      });
                      if(availableQuestions.length===0){
                        availableQuestions= questionArray.filter((q)=>!expiredQuestions.includes(q._id.toString()));
                      }
                      const available = availableQuestions.map((e) => e.question);
                      console.log("Available Questions: ", available);
          
                      if (availableQuestions.length > 0) {
                          const questionIdx = Math.floor(Math.random() * availableQuestions.length);
                          console.log("Selected question index:", questionIdx);
          
                          const nextQuestion = availableQuestions[questionIdx];
          
                          // Mark as expired and remove from questionArray
                          expiredQuestions.push(nextQuestion._id.toString());
                          questionArray = questionArray.filter((e) => e._id.toString() !== nextQuestion._id.toString());
          
                          return nextQuestion;
                      }
                  }
                  return null;
              }
          
              let nextQuestion = null;
          
              if (isCorrect) {
                  if (level === EASY) {
                      nextQuestion = getNextQuestion(MEDIUM);
                  } else if (level === MEDIUM || level === HARD) {
                      nextQuestion = getNextQuestion(HARD);
                  }
              } else {
                  if (level === EASY || level === MEDIUM) {
                      nextQuestion = getNextQuestion(EASY);
                  } else if (level === HARD) {
                      nextQuestion = getNextQuestion(MEDIUM);
                  }
              }
          
              if (!nextQuestion) {
                  console.log("All questions have been answered.");
                  socket.emit("quiz-finished", { message: "Quiz complete!" });
              } else {
                  console.log("Next question:", nextQuestion);
                  socket.emit("next-question", { question: nextQuestion });
              }
          });
          
          })
        } catch (error) {
          console.log("socket is not found")
        }
      });
})
.catch((error)=>{
console.log("ERR: MONGO DB NOT CONNECTED",error)
})

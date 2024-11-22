import express, { json } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';


const app = express();
app.use(cors({
    origin:[process.env.ORIGIN],
    credentials:true,
}))

app.use(cookieParser());

app.use(json({limit:"20KB"}))

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


import { userRouter } from './routes/user.route.js';
import { profileRouter } from './routes/profile.route.js';
import { questionRouter } from './routes/question.route.js';
import { reportRouter } from './routes/report.route.js';
import { quizRouter } from './routes/quiz.route.js';


app.use("/api/v1/user",userRouter);
app.use("/api/v1/profile",profileRouter);
app.use("/api/v1/question",questionRouter);
app.use("/api/v1/report",reportRouter);
app.use("/api/v1/quiz",quizRouter);



export default app;
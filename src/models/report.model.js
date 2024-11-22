import mongoose, { Schema } from "mongoose";
const queAns = {
  id:{
    type:String
  },
  ans:{
    type:String
  },
  correctAns:{
    type:String
  },
  question:{
    type:String
  }
}
const reportSchema = new Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    score: {
      type: Number,
      required: true,
    },
    myAnswers:[
     queAns
    ],
    correctAnswers: {
      type: Number,
      required: true,
    },
    incorrectAnswers: { type: Number, required: true },
    totalAnswered: { type: Number, required: true },
    skipped: { type: Number, required: true },
    suggestions: [String],
    completedIn:{
        type:String,
    },
    timeRemaining:{
        type:String
    },
    totalMarks:{
      type:Number
      
    }
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);

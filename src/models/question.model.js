import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: [
      String
    ],
    correct_ans: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
    },
    marks: {
      type: Number,
      required: true,
    },
    tags: [String],
    createdBy:{
     type:mongoose.Schema.Types.ObjectId,
     ref:"User"
    }
  },
  
 
  { timestamps: true }
);

export const Question = mongoose.model("Question", questionSchema);

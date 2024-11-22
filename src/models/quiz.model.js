import mongoose, { Schema } from "mongoose";

const quizSchema = new Schema({
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  title: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  instructions: [String],
  isNegativeMarking: {
    type: Boolean,
    required: true,
    default: false,
  },
  negativeMarkingSystem:{
    type:Number,
    // required:true
  },
  quizSetter:{
    type:  mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  quizImage:{
    type:String,
  }
});

export const Quiz = mongoose.model("Quiz", quizSchema);

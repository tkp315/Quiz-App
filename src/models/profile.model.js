import mongoose, { Schema } from "mongoose";

const profileSchema = new Schema(
  {
    grade: {
      type: String,
    //   required: true,
    },
    picture: {
      type: String,
    },
    reports: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Report",
        },
      ],
    // for teachers only 
    createdQuizes:[{  
      type:mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    }],
    
    bio: { type: String },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
   
    
  },

  { timestamps: true }
);
export const Profile = mongoose.model("Profile", profileSchema);

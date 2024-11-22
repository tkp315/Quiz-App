import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    googleId: {
      type: String, // For Google OAuth users
    },
    role: {
      type: String,
      enum: ["Student", "Teacher","Admin"],
      default: "Student",
    },
    password: {
      type: String,
      // required: true,
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    refreshToken:{
      type:String,
    }
  },
  { timestamps: true }
);

userSchema.pre("save",async function (next){
  if(!(this.isModified("password")))return next();

    this.password = await bcrypt.hash(this.password,10)
    next();
})


// custom methods 

userSchema.methods.isPasswordCorrect = async function(password)
{
  const res = await bcrypt.compare(password,this.password) //takes to parameter given password and encrypted password
  return res;
}

userSchema.methods.generateAccessToken =  function()
{
  return jwt.sign(
    {
      _id : this._id,
      phone:this.phone,
      name: this.name
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken =  function()
{
  return jwt.sign(
    {
      _id : this._id,
      phone:this.phone,
      name: this.name
      
      
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}




export const User = mongoose.model("User", userSchema);

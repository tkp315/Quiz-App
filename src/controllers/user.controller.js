import asyncHandlerFunction from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { Profile } from "../models/profile.model.js";

export const signup = asyncHandlerFunction(async (req, res) => {
  const { name, password, confirmPassword, email, role } = req.body;

  if ([name, password, confirmPassword, email, role].some((e) => e === "")) {
    throw new ApiError(401, "please enter all the fields");
  }

  const alreadyUser = await User.findOne({ email });
  if (alreadyUser) {
    throw new ApiError(401, "Already Registered");
  }

  if (password !== confirmPassword) {
    throw new ApiError(401, "password not matched");
  }

  const newuser = await User.create({
    name,
    email,
    password,
    role,
  });

  const profile = await Profile.create({
    user: newuser._id,
    grade: null,
    bio: null,
    picture: null,
  });
  newuser.profile = profile._id;
  await newuser.save();
  const myuser = await User.findById(newuser._id).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, myuser, "Successfully registered", true));
});

export const login = asyncHandlerFunction(async (req, res) => {
  const { email, password } = req.body;

  if (!email) throw new ApiError(401, "email not found");
  if (!password) throw new ApiError(401, "password not found");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "user is not registerd");

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "incorrect password");
  }

  const loggedInUser = await User.findById(user._id).select("-password");

  const accessToken = loggedInUser.generateAccessToken(loggedInUser._id);
  const refreshToken = loggedInUser.generateRefreshToken(loggedInUser._id);
  loggedInUser.refreshToken = refreshToken;
  await loggedInUser.save();
  const options1 = {
    httpOnly: true,
    // secure: true
  };
  const options = {
    
    secure:process.env.NODE_ENV==='production',
    sameSite:'none'
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { loggedInUser }, "User logged in successfully")
    );
});

export const logout = asyncHandlerFunction(async (req, res) => {
  const user = req.user._id;
  console.log(user);

  await User.findByIdAndUpdate(
    user,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );
  const options1 = {
    httpOnly: true,
    // secure:true
  };
  const options = {
    
    secure:process.env.NODE_ENV==='production',
    sameSite:'none'
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

export const deleteAccount = asyncHandlerFunction(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findByIdAndDelete(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User Account Successfully deleted "));
});

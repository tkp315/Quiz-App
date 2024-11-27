import { User } from "../models/user.model.js";
import asyncHandlerFunction from "../utils/asyncHandler.js";
import { oauth2client } from "../utils/googleConfig.js";
import axios from "axios";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Profile } from "../models/profile.model.js";

export const googleLogin = asyncHandlerFunction(async (req, res) => {
  const { code, role } = req.body;
  const googleRes = await oauth2client.getToken(code);
  oauth2client.setCredentials(googleRes.tokens);
  console.log(code);
  const userRes = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
  );

  const { email, name, picture } = userRes.data;

  const alreadyuser = await User.findOne({ email });

let newuser=alreadyuser;
let googleProfile;
if(!alreadyuser){
 newuser = await User.create({
    email,
    name,
    googleId: email,
    role,
  });
  const profile = await Profile.create({
    user: newuser._id,
    grade: null,
    bio: null,
    picture: null,
  });
  newuser.profile = profile._id;
  googleProfile= await Profile.findById(profile._id).populate('reports').populate('createdQuizes');
}
  googleProfile = await Profile.findById(newuser.profile).populate('reports').populate('createdQuizes');
  const accessToken = newuser.generateAccessToken(newuser._id);
  const refreshToken = newuser.generateRefreshToken(newuser._id);

  newuser.refreshToken = refreshToken;
  await newuser.save();
  const options = {
    httpOnly: true,
  };
  const option = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(new ApiResponse(200, {user:newuser,profile:googleProfile}, "Successfully logged in using google"));
});


import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createProfile, getDetails } from "../controllers/profile.controller.js";
const profileRouter = Router();

profileRouter.route('/edit-profile').post(
    verifyJWT,
    upload.single('picture'),
    createProfile
)

profileRouter.route('/profile-details').get(verifyJWT,getDetails)

export {profileRouter}
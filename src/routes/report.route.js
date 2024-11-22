import { Router } from "express";
import { reports } from "../controllers/report.controller.js";
import { isStudent, verifyJWT } from "../middleware/auth.middleware.js";

const reportRouter = Router();

reportRouter.route('/reports').get(verifyJWT,reports)

export {reportRouter}
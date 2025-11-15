import express from "express";
import { validateUser } from "../../middlewares/validateUser.js";
import { InterviewController } from "./interview.controller.js";
import { UserRole } from "../user/user.constant.js";

const router = express.Router();

router.post(
  "/start-interview",
  validateUser(UserRole.candidate),
  InterviewController.startInterview
);

export const InterviewRoutes = router;

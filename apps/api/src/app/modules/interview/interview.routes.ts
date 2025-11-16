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

router.get(
  "/my-interviews",
  validateUser(UserRole.candidate),
  InterviewController.getMyInterviews
);

router.get(
  "/:interviewId",
  validateUser(UserRole.candidate),
  InterviewController.getSingleInterview
);

router.post(
  "/conduct-interview/:interviewId",
  validateUser(UserRole.candidate),
  InterviewController.conductInterview
);

router.patch(
  "/finish-interview/:interviewId",
  validateUser(UserRole.candidate),
  InterviewController.finishInterview
);

export const InterviewRoutes = router;

import express from "express";
import { validateUser } from "../../middlewares/validateUser.js";
import { InterviewController } from "./interview.controller.js";
import { UserRole } from "../user/user.constant.js";

const router = express.Router();

router.post(
  "/create-interview",
  validateUser(UserRole.candidate),
  InterviewController.createInterview
);

router.post(
  "/save-question",
  validateUser(UserRole.candidate),
  InterviewController.saveQuestion
);

router.get(
  "/my-interviews",
  validateUser(UserRole.candidate),
  InterviewController.getMyInterviews
);

router.get(
  "/get-resume",
  validateUser(UserRole.candidate),
  InterviewController.getCandidateResume
);

router.get(
  "/:interviewId",
  validateUser(UserRole.candidate, UserRole.recruiter),
  InterviewController.getSingleInterview
);

router.patch(
  "/finish-interview/:interviewId",
  validateUser(UserRole.candidate),
  InterviewController.finishInterview
);

router.patch(
  "/evaluate-interview/:interviewId",
  validateUser(UserRole.candidate),
  InterviewController.evaluateInterview
);

router.patch(
  "/save-recording-url/:interviewId",
  validateUser(UserRole.candidate),
  InterviewController.saveRecordingUrl
);

export const InterviewRoutes = router;

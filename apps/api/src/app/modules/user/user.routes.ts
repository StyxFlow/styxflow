import express from "express";
import { UserController } from "./user.controller.js";
import { upload } from "../../../lib/multer.js";
import { validateUser } from "../../middlewares/validateUser.js";
import { UserRole } from "./user.constant.js";

const router = express.Router();

router.post(
  "/upload-resume",
  validateUser(UserRole.candidate),
  upload.single("resume"),
  UserController.uploadResume
);

router.get(
  "/my-profile",
  validateUser(UserRole.candidate, UserRole.recruiter),
  UserController.getMyProfile
);

router.get(
  "/candidate-profile/:candidateId",
  validateUser(UserRole.recruiter),
  UserController.getCandidateProfile
);

export const UserRoutes = router;

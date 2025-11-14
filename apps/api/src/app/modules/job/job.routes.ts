import express from "express";
import { validateUser } from "../../middlewares/validateUser.js";
import { JobController } from "./job.controller.js";
import { UserRole } from "../user/user.constant.js";

const router = express.Router();

router.post("/", validateUser(UserRole.recruiter), JobController.createJob);
router.get(
  "/my-uploaded-jobs",
  validateUser(UserRole.recruiter),
  JobController.getMyUploadedJobs
);

export const JobRoutes = router;

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
router.get(
  "/find-employees-for-job/:jobId",
  validateUser(UserRole.recruiter),
  JobController.findEmployeesForJob
);
router.get(
  "/single-job/:jobId",
  validateUser(UserRole.recruiter),
  JobController.getSingleJob
);

export const JobRoutes = router;

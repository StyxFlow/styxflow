import express from "express";
import { validateUser } from "../../middlewares/validateUser.js";
import { JobController } from "./job.controller.js";

const router = express.Router();

router.post("/", validateUser(), JobController.createJob);

export const JobRoutes = router;

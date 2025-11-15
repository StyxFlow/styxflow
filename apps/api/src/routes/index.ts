import express from "express";
import { UserRoutes } from "../app/modules/user/user.routes.js";
import { JobRoutes } from "../app/modules/job/job.routes.js";
import { InterviewRoutes } from "../app/modules/interview/interview.routes.js";
// import { InterviewRoutes } from "../app/modules/interview/interview.routes.js";

console.log("routes/index.ts loaded");

const router = express.Router();

const appRoutes = [
  {
    path: "/user",
    routes: UserRoutes,
  },
  {
    path: "/job",
    routes: JobRoutes,
  },
  // TODO: Fix Qdrant connection issue before enabling InterviewRoutes
  {
    path: "/interview",
    routes: InterviewRoutes,
  },
];

appRoutes.forEach((route) => router.use(route.path, route.routes));

export default router;

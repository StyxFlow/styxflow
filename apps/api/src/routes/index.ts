import express from "express";
import { UserRoutes } from "../app/modules/user/user.routes.js";
import { JobRoutes } from "../app/modules/job/job.routes.js";

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
];

appRoutes.forEach((route) => router.use(route.path, route.routes));

export default router;

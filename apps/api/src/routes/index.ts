import express from "express";
import { UserRoutes } from "../app/modules/user/user.routes.js";

const router = express.Router();

const appRoutes = [
  {
    path: "/user",
    routes: UserRoutes,
  },
];

appRoutes.forEach((route) => router.use(route.path, route.routes));

export default router;

import express from "express";
import { UserController } from "./user.controller.js";

const router = express.Router();

router.post("/confirm-role", UserController.confirmRole);
export const UserRoutes = router;

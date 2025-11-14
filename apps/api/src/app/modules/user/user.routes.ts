import express from "express";
import { UserController } from "./user.controller.js";
import { upload } from "../../../lib/multer.js";
import { validateUser } from "../../middlewares/validateUser.js";
import { UserRole } from "./user.constant.js";

const router = express.Router();

router.post(
  "/upload-resume",
  validateUser(),
  upload.single("resume"),
  UserController.uploadResume
);
export const UserRoutes = router;

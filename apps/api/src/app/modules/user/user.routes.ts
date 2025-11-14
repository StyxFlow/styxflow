import express from "express";
import { UserController } from "./user.controller.js";
import { upload } from "../../../lib/multer.js";

const router = express.Router();

router.post(
  "/upload-resume",
  upload.single("resume"),
  UserController.uploadResume
);
export const UserRoutes = router;

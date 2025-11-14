import path from "path";
import fs from "fs";
import { catchAsync } from "../../../shared/catchAsync.js";
import { sendResponse } from "../../../shared/sendResponse.js";

const uploadResume = catchAsync(async (req, res) => {
  const absolutePath = path.resolve(req.file!.path);
  fs.unlink(absolutePath, (err) => {
    if (err) {
      console.error("Error deleting file:", absolutePath, err);
      return;
    }
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User role confirmed successfully",
    data: req.file,
  });
});

export const UserController = {
  uploadResume,
};

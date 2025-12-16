import { catchAsync } from "../../../shared/catchAsync.js";
import { sendResponse } from "../../../shared/sendResponse.js";
import type { ICustomRequest } from "../../../interface/index.js";
import { UserService } from "./user.service.js";

const uploadResume = catchAsync(async (req: ICustomRequest, res) => {
  await UserService.uploadResume(req.user!.id, req.file!.path);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User role confirmed successfully",
    data: {},
  });
});

const getMyProfile = catchAsync(async (req: ICustomRequest, res) => {
  const result = await UserService.getMyProfile(req.user!.id, req.user!.role!);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile retrievedsuccessfully",
    data: result,
  });
});

export const UserController = {
  uploadResume,
  getMyProfile,
};

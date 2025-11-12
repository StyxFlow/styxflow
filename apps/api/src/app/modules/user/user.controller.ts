import { catchAsync } from "../../../shared/catchAsync.js";
import { sendResponse } from "../../../shared/sendResponse.js";
import { UserService } from "./user.service.js";

const confirmRole = catchAsync(async (req, res) => {
  const result = await UserService.confirmUserRole(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User role confirmed successfully",
    data: result,
  });
});

export const UserController = {
  confirmRole,
};

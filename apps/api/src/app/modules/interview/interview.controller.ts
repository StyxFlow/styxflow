import type { ICustomRequest } from "../../../interface/index.js";
import { catchAsync } from "../../../shared/catchAsync.js";
import { sendResponse } from "../../../shared/sendResponse.js";
import { InterviewService } from "./interview.service.js";

const startInterview = catchAsync(async (req: ICustomRequest, res) => {
  const result = await InterviewService.startInterview(req.user!.id);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Interview started successfully",
    data: result,
  });
});

export const InterviewController = {
  startInterview,
};

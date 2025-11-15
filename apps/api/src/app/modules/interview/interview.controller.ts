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

const getMyInterviews = catchAsync(async (req: ICustomRequest, res) => {
  const result = await InterviewService.getMyInterviews(req.user!.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Interviews retrieved successfully",
    data: result,
  });
});

const conductInterview = catchAsync(async (req: ICustomRequest, res) => {
  const result = await InterviewService.conductInterview(
    req.user!.id,
    req.params.interviewId!
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Interview conducted successfully",
    data: result,
  });
});

export const InterviewController = {
  startInterview,
  conductInterview,
  getMyInterviews,
};

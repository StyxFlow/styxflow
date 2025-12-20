import type { ICustomRequest } from "../../../interface/index.js";
import { catchAsync } from "../../../shared/catchAsync.js";
import { sendResponse } from "../../../shared/sendResponse.js";
import { InterviewService } from "./interview.service.js";

const createInterview = catchAsync(async (req: ICustomRequest, res) => {
  const result = await InterviewService.createInterview(req.user!.id);
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

const finishInterview = catchAsync(async (req: ICustomRequest, res) => {
  const result = await InterviewService.finishInterview(
    req.user!.id,
    req.params.interviewId!
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Interview finished successfully",
    data: result,
  });
});

const getSingleInterview = catchAsync(async (req: ICustomRequest, res) => {
  const result = await InterviewService.getSingleInterview(
    req.user!.id,
    req.params.interviewId!
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Interview fetched successfully",
    data: result,
  });
});

const getCandidateResume = catchAsync(async (req: ICustomRequest, res) => {
  const result = await InterviewService.getCandidateResume(req.user!.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Interview questions generated successfully",
    data: result,
  });
});

const saveQuestion = catchAsync(async (req: ICustomRequest, res) => {
  await InterviewService.saveQuestion(req.body, req.user!.id);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Question created successfully",
    data: {},
  });
});

const evaluateInterview = catchAsync(async (req: ICustomRequest, res) => {
  await InterviewService.evaluateInterview(
    { transcript: req.body.transcript, interviewId: req.params.interviewId! },
    req.user!.id
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Interview evaluated successfully",
    data: { score: 10, feedback: "Great job!" },
  });
});

export const InterviewController = {
  createInterview,
  getMyInterviews,
  finishInterview,
  getSingleInterview,
  getCandidateResume,
  saveQuestion,
  evaluateInterview,
};

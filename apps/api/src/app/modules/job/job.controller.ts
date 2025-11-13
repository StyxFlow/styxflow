import type { ICustomRequest } from "../../../interface/index.js";
import { catchAsync } from "../../../shared/catchAsync.js";
import { sendResponse } from "../../../shared/sendResponse.js";
import { JobService } from "./job.service.js";

const createJob = catchAsync(async (req: ICustomRequest, res) => {
  const result = await JobService.createJob(req.user!, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Job created successfully",
    data: result,
  });
});

export const JobController = {
  createJob,
};

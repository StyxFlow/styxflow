import { catchAsync } from "../../../shared/catchAsync.js";
import { sendResponse } from "../../../shared/sendResponse.js";
import { JobService } from "./job.service.js";

const createJob = catchAsync(async (req, res) => {
  console.log("hit controller");
  const result = await JobService.createJob();
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

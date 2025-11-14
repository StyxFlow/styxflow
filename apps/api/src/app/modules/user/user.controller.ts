import { catchAsync } from "../../../shared/catchAsync.js";
import { sendResponse } from "../../../shared/sendResponse.js";
import { addResumeToQueue } from "../../../queues/producer.js";
import type { ICustomRequest } from "../../../interface/index.js";

const uploadResume = catchAsync(async (req: ICustomRequest, res) => {
  if (req?.file) {
    const queueData = { filePath: req.file.path, userId: req.user!.id };
    await addResumeToQueue(JSON.stringify(queueData));
  }

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

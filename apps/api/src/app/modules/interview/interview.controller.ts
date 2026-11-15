import { RoomServiceClient, WebhookReceiver } from "livekit-server-sdk";
import type { ICustomRequest } from "../../../interface/index.js";
import { catchAsync } from "../../../shared/catchAsync.js";
import { sendResponse } from "../../../shared/sendResponse.js";
import { InterviewService } from "./interview.service.js";
import config from "../../../config/index.js";
import { addInterviewerConnectJobToQueue } from "../../../queues/producer.js";

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
    req.params.interviewId!,
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
    req.params.interviewId!,
    req.user!.role!,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Interview fetched successfully",
    data: result,
  });
});

const getCandidateResume = catchAsync(async (req: ICustomRequest, res) => {
  console.log("resume");
  const result = await InterviewService.getCandidateResume(req.user!.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Resume fetched successfully",
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
  const data = await InterviewService.evaluateInterview(
    { transcript: req.body.transcript, interviewId: req.params.interviewId! },
    req.user!.id,
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Interview evaluated successfully",
    data,
  });
});

const saveRecordingUrl = catchAsync(async (req: ICustomRequest, res) => {
  const data = await InterviewService.saveRecordingUrl(
    req.params.interviewId!,
    req.body.recordingUrl,
    req.user!.id,
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Interview recording saved successfully",
    data,
  });
});

const connectInterviewer = catchAsync(async (req: ICustomRequest, res) => {
  console.log("sss");
  try {
    const receiver = new WebhookReceiver(
      config.livekit.api_key!,
      config.livekit.api_secret!,
    );
    const roomServiceUrl = config.livekit.url?.replace(/^ws/, "http");
    const roomService = new RoomServiceClient(
      roomServiceUrl!,
      config.livekit.api_key!,
      config.livekit.api_secret!,
    );

    console.log(receiver);
    const event = await receiver.receive(req.body, req.get("Authorization"));
    console.log("Received LiveKit webhook event:", event.event);
    if (event.event === "participant_joined") {
      const roomName = event.room?.name;
      const participantName = event.participant?.identity;

      if (!roomName || !participantName) {
        sendResponse(res, {
          statusCode: 200,
          success: true,
          message: "Webhook ignored: missing room or participant",
          data: {},
        });
        return;
      }

      if (participantName.startsWith("interviewer-")) {
        sendResponse(res, {
          statusCode: 200,
          success: true,
          message: "Webhook ignored: interviewer bot",
          data: {},
        });
        return;
      }

      console.log(`${participantName} joined ${roomName}. Booting up AI...`);
      // Fire off your worker function in the background!
      // Do NOT await it here, otherwise LiveKit's webhook will timeout
      await addInterviewerConnectJobToQueue(roomName!);
    }

    if (event.event === "participant_left") {
      const roomName = event.room?.name;
      const participantName = event.participant?.identity;

      if (!roomName || !participantName) {
        sendResponse(res, {
          statusCode: 200,
          success: true,
          message: "Webhook ignored: missing room or participant",
          data: {},
        });
        return;
      }

      if (participantName.startsWith("interviewer-")) {
        sendResponse(res, {
          statusCode: 200,
          success: true,
          message: "Webhook ignored: interviewer bot",
          data: {},
        });
        return;
      }

      const interviewerIdentity = `interviewer-${roomName}`;
      await roomService.removeParticipant(roomName, interviewerIdentity);
      console.log(`Disconnected ${interviewerIdentity} from ${roomName}`);
    }
  } catch (error) {
    console.log(error);
  }

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Interview access token sent succsessfully",
    data: {},
  });
});

const getGenAiAccessToken = catchAsync(async (req: ICustomRequest, res) => {
  const payload = {
    resume: req.body.resume,
    voice: req.body.voice,
  };
  const data = await InterviewService.getGenAiAccessToken(
    payload,
    req.user!.id,
    req.params.interviewId!,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Interview access token sent succsessfully",
    data,
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
  saveRecordingUrl,
  connectInterviewer,
  getGenAiAccessToken,
};

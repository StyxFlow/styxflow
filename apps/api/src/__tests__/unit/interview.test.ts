import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db/drizzle.js";
import { getVectorStore } from "../../db/qdrant.js";
import type { IInterview, IQuestion } from "../../db/types.js";
import { InterviewService } from "../../app/modules/interview/interview.service.js";

vi.mock("../../db/drizzle.js", () => ({
  db: {
    query: {
      candidate: {
        findFirst: vi.fn(),
      },
      interview: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      question: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("../../queues/producer.js", () => ({
  addResumeToQueue: vi.fn(),
}));

vi.mock("../../db/qdrant.js", () => ({
  getVectorStore: vi.fn(),
}));

const mockInvoke = vi.fn();
vi.mock("@langchain/groq", () => {
  return {
    ChatGroq: class MockChatGroq {
      constructor() {}
      invoke = mockInvoke;
    },
  };
});

// Create a reusable mock vector store
const createMockVectorStore = (resumeChunks: any[] = []) => ({
  similaritySearchWithScore: vi.fn().mockResolvedValue(resumeChunks),
});

// Helpers
const createInsertMock = (returnValue: any) => ({
  values: vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([returnValue]),
  }),
});

const createUpdateMock = (returnValue: any) => ({
  set: vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([returnValue]),
    }),
  }),
});

describe("Interview Service - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Create Interview", () => {
    it("Should create interview successfully when there is no active interview and resume exists", async () => {
      const mockCandidate = {
        id: "candidate-123",
        userId: "user-123",
        fullName: "John Doe",
        createdAt: new Date(),
        updatedAt: new Date(),
        address: null,
      };
      const allInterviews: IInterview[] = [
        {
          id: "interview-123",
          candidateId: "candidate-123",
          isActive: false,
          score: 100,
          feedback: "Great",
          attempt: 1,
          isCompleted: true,
          recordingUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "interview-1234",
          candidateId: "candidate-123",
          isActive: false,
          score: 10,
          feedback: "Needs Improvement",
          attempt: 2,
          isCompleted: true,
          recordingUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResumeChunks = [
        [
          {
            pageContent: "Resume content...",
            metadata: { candidateId: "candidate-123", chunkIndex: 0 },
          },
          0.95,
        ],
      ];
      const mockNewInterview: IInterview = {
        id: "interview-new",
        candidateId: "candidate-123",
        isActive: true,
        score: null,
        feedback: null,
        attempt: 3, // allInterviews.length + 1 = 2 + 1
        isCompleted: false,
        recordingUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.query.candidate.findFirst).mockResolvedValue(mockCandidate);
      vi.mocked(db.query.interview.findMany).mockResolvedValue(allInterviews);
      vi.mocked(getVectorStore).mockResolvedValue(
        createMockVectorStore(mockResumeChunks) as any,
      );
      vi.mocked(db.insert).mockReturnValue(
        createInsertMock(mockNewInterview) as any,
      );

      // Act - call the service
      const result = await InterviewService.createInterview("user-123");

      // Assert
      expect(result.newInterview).toBeDefined();
      expect(result.newInterview?.id).toBe("interview-new");
      expect(result.newInterview?.isActive).toBe(true);
      expect(result.newInterview?.attempt).toBe(3);
      expect(result.newInterview?.candidateId).toBe("candidate-123");

      // Verify mocks were called correctly
      expect(db.query.candidate.findFirst).toHaveBeenCalledOnce();
      expect(db.query.interview.findMany).toHaveBeenCalledOnce();
      expect(getVectorStore).toHaveBeenCalledOnce();
      expect(db.insert).toHaveBeenCalledOnce();
    });
    it("Should throw ApiError when candidate profile not found", async () => {
      const mockCandidate = undefined;
      vi.mocked(db.query.candidate.findFirst).mockResolvedValue(mockCandidate);
      await expect(
        InterviewService.createInterview("user-123"),
      ).rejects.toThrow("Candidate profile not found");
    });
    it("Should throw ApiError when an active interview already exists", async () => {
      const mockCandidate = {
        id: "candidate-123",
        userId: "user-123",
        fullName: "John Doe",
        createdAt: new Date(),
        updatedAt: new Date(),
        address: null,
      };
      const allInterviews: IInterview[] = [
        {
          id: "interview-123",
          candidateId: "candidate-123",
          isActive: false,
          score: 100,
          feedback: "Great",
          attempt: 1,
          isCompleted: true,
          recordingUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "interview-1234",
          candidateId: "candidate-123",
          isActive: true,
          score: null,
          feedback: "Needs Improvement",
          attempt: 2,
          isCompleted: false,
          recordingUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.query.candidate.findFirst).mockResolvedValue(mockCandidate);
      vi.mocked(db.query.interview.findMany).mockResolvedValue(allInterviews);
      await expect(
        InterviewService.createInterview("user-123"),
      ).rejects.toThrow("An active interview already exists");
    });
    it("Should throw ApiError when resume is not uploaded", async () => {
      const mockCandidate = {
        id: "candidate-123",
        userId: "user-123",
        fullName: "John Doe",
        createdAt: new Date(),
        updatedAt: new Date(),
        address: null,
      };
      const allInterviews: IInterview[] = [
        {
          id: "interview-123",
          candidateId: "candidate-123",
          isActive: false,
          score: 100,
          feedback: "Great",
          attempt: 1,
          isCompleted: true,
          recordingUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "interview-1234",
          candidateId: "candidate-123",
          isActive: false,
          score: 10,
          feedback: "Needs Improvement",
          attempt: 2,
          isCompleted: false,
          recordingUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockResumeChunks: [
        {
          pageContent: string;
          metadata: { candidateId: string; chunkIndex: number };
        },
        number,
      ][] = [];

      vi.mocked(db.query.candidate.findFirst).mockResolvedValue(mockCandidate);
      vi.mocked(db.query.interview.findMany).mockResolvedValue(allInterviews);
      vi.mocked(getVectorStore).mockResolvedValue(
        createMockVectorStore(mockResumeChunks) as any,
      );

      await expect(
        InterviewService.createInterview("user-123"),
      ).rejects.toThrow("No resume found for the candidate");
    });
  });

  describe("Finish interview", () => {
    it("should finish interview successfully when interview exists", async () => {
      const mockInterviewWithCandidate = {
        id: "interview-123",
        candidateId: "candidate-123",
        isActive: true,
        score: null,
        feedback: null,
        attempt: 1,
        isCompleted: false,
        recordingUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        candidate: {
          id: "candidate-123",
          userId: "user-123",
          fullName: "John Doe",
          createdAt: new Date(),
          updatedAt: new Date(),
          address: null,
        },
      };
      const mockedQuestions: IQuestion[] = [
        {
          id: "question-123",
          interviewId: "interview-123",
          questionText: "What is your greatest strength?",
          answerText: "My greatest strength is problem-solving.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockUpdatedInterview: IInterview = {
        id: "interview-123",
        candidateId: "candidate-123",
        isActive: false,
        score: 85,
        feedback: "Good problem-solving skills demonstrated.",
        attempt: 1,
        isCompleted: true,
        recordingUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock LLM response
      mockInvoke.mockResolvedValue({
        content:
          '{"score": 85, "feedback": "Good problem-solving skills demonstrated."}',
      });

      vi.mocked(db.query.interview.findFirst).mockResolvedValue(
        mockInterviewWithCandidate,
      );
      vi.mocked(db.query.question.findMany).mockResolvedValue(mockedQuestions);
      vi.mocked(db.update).mockReturnValue(
        createUpdateMock(mockUpdatedInterview) as any,
      );

      // Act
      const result = await InterviewService.finishInterview(
        "user-123",
        "interview-123",
      );

      // Assert
      expect(result).toBeDefined();
      expect(result?.isActive).toBe(false);
      expect(result?.isCompleted).toBe(true);
      expect(result?.score).toBe(85);
      expect(result?.feedback).toBe(
        "Good problem-solving skills demonstrated.",
      );
      expect(mockInvoke).toHaveBeenCalledOnce();
      expect(db.update).toHaveBeenCalledOnce();
    });
    it("should throw ApiError when interview not found", async () => {
      vi.mocked(db.query.interview.findFirst).mockResolvedValue(undefined);

      await expect(
        InterviewService.finishInterview("user-123", "interview-123"),
      ).rejects.toThrow("Interview not found");
    });
    it("should throw ApiError when user is not the owner of the interview", async () => {
      const mockInterviewWithCandidate = {
        id: "interview-123",
        candidateId: "candidate-123",
        isActive: true,
        score: null,
        feedback: null,
        attempt: 1,
        isCompleted: false,
        recordingUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        candidate: {
          id: "candidate-123",
          userId: "different-user", // Different user
          fullName: "John Doe",
          createdAt: new Date(),
          updatedAt: new Date(),
          address: null,
        },
      };

      vi.mocked(db.query.interview.findFirst).mockResolvedValue(
        mockInterviewWithCandidate,
      );

      await expect(
        InterviewService.finishInterview("user-123", "interview-123"),
      ).rejects.toThrow("Unauthorized access to this interview");
    });
  });

  describe("Get Candidate Resume", () => {
    it("should return resume text when candidate and resume exist", async () => {
      const mockCandidate = {
        id: "candidate-123",
        userId: "user-123",
        fullName: "John Doe",
        createdAt: new Date(),
        updatedAt: new Date(),
        address: null,
      };

      const mockResumeChunks = [
        [
          {
            pageContent: "Part 2 of resume",
            metadata: { candidateId: "candidate-123", chunkIndex: 1 },
          },
          0.9,
        ],
        [
          {
            pageContent: "Part 1 of resume",
            metadata: { candidateId: "candidate-123", chunkIndex: 0 },
          },
          0.95,
        ],
      ];

      vi.mocked(db.query.candidate.findFirst).mockResolvedValue(mockCandidate);
      vi.mocked(getVectorStore).mockResolvedValue(
        createMockVectorStore(mockResumeChunks) as any,
      );

      const result = await InterviewService.getCandidateResume("user-123");

      expect(result.resume).toBeDefined();
      expect(result.resume).toBe("Part 1 of resume\nPart 2 of resume");
      expect(db.query.candidate.findFirst).toHaveBeenCalledOnce();
      expect(getVectorStore).toHaveBeenCalledOnce();
    });
    it("should throw ApiError when candidate not found", async () => {
      vi.mocked(db.query.candidate.findFirst).mockResolvedValue(undefined);

      await expect(
        InterviewService.getCandidateResume("user-123"),
      ).rejects.toThrow("Interview not found");
    });
    it("should throw ApiError when no resume found", async () => {
      const mockCandidate = {
        id: "candidate-123",
        userId: "user-123",
        fullName: "John Doe",
        createdAt: new Date(),
        updatedAt: new Date(),
        address: null,
      };

      vi.mocked(db.query.candidate.findFirst).mockResolvedValue(mockCandidate);
      vi.mocked(getVectorStore).mockResolvedValue(
        createMockVectorStore([]) as any,
      );

      await expect(
        InterviewService.getCandidateResume("user-123"),
      ).rejects.toThrow("No resume found for the candidate");
    });
  });

  describe("Evaluate Interview", () => {
    it("should evaluate interview successfully", async () => {
      const mockInterviewWithCandidate = {
        id: "interview-123",
        candidateId: "candidate-123",
        isActive: true,
        score: null,
        feedback: null,
        attempt: 1,
        isCompleted: false,
        recordingUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        candidate: {
          id: "candidate-123",
          userId: "user-123",
          fullName: "John Doe",
          createdAt: new Date(),
          updatedAt: new Date(),
          address: null,
        },
      };

      const mockUpdatedInterview: IInterview = {
        id: "interview-123",
        candidateId: "candidate-123",
        isActive: false,
        score: 75,
        feedback: "Candidate showed good communication skills.",
        attempt: 1,
        isCompleted: true,
        recordingUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockInvoke.mockResolvedValue({
        content:
          '{"score": 75, "feedback": "Candidate showed good communication skills."}',
      });

      vi.mocked(db.query.interview.findFirst).mockResolvedValue(
        mockInterviewWithCandidate,
      );
      vi.mocked(db.update).mockReturnValue(
        createUpdateMock(mockUpdatedInterview) as any,
      );

      const result = await InterviewService.evaluateInterview(
        {
          transcript:
            "Interviewer: Tell me about yourself.\nCandidate: I am a software developer...",
          interviewId: "interview-123",
        },
        "user-123",
      );

      expect(result).toBeDefined();
      expect(result?.isActive).toBe(false);
      expect(result?.isCompleted).toBe(true);
      expect(result?.score).toBe(75);
      expect(result?.feedback).toBe(
        "Candidate showed good communication skills.",
      );
      expect(mockInvoke).toHaveBeenCalledOnce();
      expect(db.update).toHaveBeenCalledOnce();
    });
    it("should throw ApiError when interview not found", async () => {
      vi.mocked(db.query.interview.findFirst).mockResolvedValue(undefined);

      await expect(
        InterviewService.evaluateInterview(
          { transcript: "test", interviewId: "interview-123" },
          "user-123",
        ),
      ).rejects.toThrow("Interview not found");
    });
    it("should throw ApiError when interview is not active", async () => {
      const mockInterviewWithCandidate = {
        id: "interview-123",
        candidateId: "candidate-123",
        isActive: false, // Not active
        score: 50,
        feedback: "Previous feedback",
        attempt: 1,
        isCompleted: true,
        recordingUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        candidate: {
          id: "candidate-123",
          userId: "user-123",
          fullName: "John Doe",
          createdAt: new Date(),
          updatedAt: new Date(),
          address: null,
        },
      };

      vi.mocked(db.query.interview.findFirst).mockResolvedValue(
        mockInterviewWithCandidate,
      );

      await expect(
        InterviewService.evaluateInterview(
          { transcript: "test", interviewId: "interview-123" },
          "user-123",
        ),
      ).rejects.toThrow("Cannot save question to an inactive interview");
    });
    it("should throw ApiError when user is not the owner", async () => {
      const mockInterviewWithCandidate = {
        id: "interview-123",
        candidateId: "candidate-123",
        isActive: true,
        score: null,
        feedback: null,
        attempt: 1,
        isCompleted: false,
        recordingUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        candidate: {
          id: "candidate-123",
          userId: "different-user",
          fullName: "John Doe",
          createdAt: new Date(),
          updatedAt: new Date(),
          address: null,
        },
      };

      vi.mocked(db.query.interview.findFirst).mockResolvedValue(
        mockInterviewWithCandidate,
      );

      await expect(
        InterviewService.evaluateInterview(
          { transcript: "test", interviewId: "interview-123" },
          "user-123",
        ),
      ).rejects.toThrow("Unauthorized access to this interview");
    });
  });

  describe("Save Recording URL", () => {
    it("should save recording URL successfully", async () => {
      const mockInterviewWithCandidate = {
        id: "interview-123",
        candidateId: "candidate-123",
        isActive: false,
        score: 85,
        feedback: "Great interview",
        attempt: 1,
        isCompleted: true,
        recordingUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        candidate: {
          id: "candidate-123",
          userId: "user-123",
          fullName: "John Doe",
          createdAt: new Date(),
          updatedAt: new Date(),
          address: null,
        },
      };

      const mockUpdatedInterview: IInterview = {
        id: "interview-123",
        candidateId: "candidate-123",
        isActive: false,
        score: 85,
        feedback: "Great interview",
        attempt: 1,
        isCompleted: true,
        recordingUrl: "https://example.com/recording.mp4",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.query.interview.findFirst).mockResolvedValue(
        mockInterviewWithCandidate,
      );
      vi.mocked(db.update).mockReturnValue(
        createUpdateMock(mockUpdatedInterview) as any,
      );

      await InterviewService.saveRecordingUrl(
        "interview-123",
        "https://example.com/recording.mp4",
        "user-123",
      );

      expect(db.query.interview.findFirst).toHaveBeenCalledOnce();
      expect(db.update).toHaveBeenCalledOnce();
    });
    it("should throw ApiError when interview not found", async () => {
      vi.mocked(db.query.interview.findFirst).mockResolvedValue(undefined);

      await expect(
        InterviewService.saveRecordingUrl(
          "interview-123",
          "https://example.com/recording.mp4",
          "user-123",
        ),
      ).rejects.toThrow("Interview not found");
    });
    it("should throw ApiError when user is not the owner", async () => {
      const mockInterviewWithCandidate = {
        id: "interview-123",
        candidateId: "candidate-123",
        isActive: false,
        score: 85,
        feedback: "Great interview",
        attempt: 1,
        isCompleted: true,
        recordingUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        candidate: {
          id: "candidate-123",
          userId: "different-user",
          fullName: "John Doe",
          createdAt: new Date(),
          updatedAt: new Date(),
          address: null,
        },
      };

      vi.mocked(db.query.interview.findFirst).mockResolvedValue(
        mockInterviewWithCandidate,
      );

      await expect(
        InterviewService.saveRecordingUrl(
          "interview-123",
          "https://example.com/recording.mp4",
          "user-123",
        ),
      ).rejects.toThrow("Unauthorized access to this interview");
    });
    it("should throw ApiError when update fails", async () => {
      const mockInterviewWithCandidate = {
        id: "interview-123",
        candidateId: "candidate-123",
        isActive: false,
        score: 85,
        feedback: "Great interview",
        attempt: 1,
        isCompleted: true,
        recordingUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        candidate: {
          id: "candidate-123",
          userId: "user-123",
          fullName: "John Doe",
          createdAt: new Date(),
          updatedAt: new Date(),
          address: null,
        },
      };

      // Mock update returning empty array (no result)
      const failedUpdateMock = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      };

      vi.mocked(db.query.interview.findFirst).mockResolvedValue(
        mockInterviewWithCandidate,
      );
      vi.mocked(db.update).mockReturnValue(failedUpdateMock as any);

      await expect(
        InterviewService.saveRecordingUrl(
          "interview-123",
          "https://example.com/recording.mp4",
          "user-123",
        ),
      ).rejects.toThrow("Failed to save recording URL");
    });
  });
});

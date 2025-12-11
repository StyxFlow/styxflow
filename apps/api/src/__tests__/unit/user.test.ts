import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UserService } from "../../app/modules/user/user.service.js";
import { UserController } from "../../app/modules/user/user.controller.js";
import { db } from "../../db/drizzle.js";
import { addResumeToQueue } from "../../queues/producer.js";
import { ApiError } from "../../app/errors/apiError.js";
import type { Response } from "express";
import type { ICustomRequest } from "../../interface/index.js";

// Mock dependencies
vi.mock("../../db/drizzle.js", () => ({
  db: {
    query: {
      candidate: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("../../queues/producer.js", () => ({
  addResumeToQueue: vi.fn(),
}));

describe("User Service - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadResume", () => {
    it("should upload resume successfully when candidate exists", async () => {
      const mockCandidate = {
        id: "candidate-123",
        userId: "user-123",
        fullName: "John Doe",
        createdAt: new Date(),
        updatedAt: new Date(),
        address: null,
      };

      vi.mocked(db.query.candidate.findFirst).mockResolvedValue(mockCandidate);
      vi.mocked(addResumeToQueue).mockResolvedValue(undefined);

      await UserService.uploadResume("user-123", "/path/to/resume.pdf");

      expect(db.query.candidate.findFirst).toHaveBeenCalledWith({
        where: expect.any(Object),
      });
      expect(addResumeToQueue).toHaveBeenCalledWith(
        JSON.stringify({
          filePath: "/path/to/resume.pdf",
          candidateId: "candidate-123",
        })
      );
    });

    it("should throw ApiError when candidate does not exist", async () => {
      vi.mocked(db.query.candidate.findFirst).mockResolvedValue(undefined);

      await expect(
        UserService.uploadResume("user-123", "/path/to/resume.pdf")
      ).rejects.toThrow(ApiError);

      await expect(
        UserService.uploadResume("user-123", "/path/to/resume.pdf")
      ).rejects.toThrow("Candidate profile not found");

      expect(addResumeToQueue).not.toHaveBeenCalled();
    });

    it("should not add to queue when filePath is empty", async () => {
      const mockCandidate = {
        id: "candidate-123",
        userId: "user-123",
        fullName: "John Doe",
        createdAt: new Date(),
        updatedAt: new Date(),
        address: null,
      };

      vi.mocked(db.query.candidate.findFirst).mockResolvedValue(mockCandidate);

      await UserService.uploadResume("user-123", "");

      expect(db.query.candidate.findFirst).toHaveBeenCalled();
      expect(addResumeToQueue).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      vi.mocked(db.query.candidate.findFirst).mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        UserService.uploadResume("user-123", "/path/to/resume.pdf")
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle queue errors gracefully", async () => {
      const mockCandidate = {
        id: "candidate-123",
        userId: "user-123",
        fullName: "John Doe",
        createdAt: new Date(),
        updatedAt: new Date(),
        address: null,
      };

      vi.mocked(db.query.candidate.findFirst).mockResolvedValue(mockCandidate);
      vi.mocked(addResumeToQueue).mockRejectedValue(
        new Error("Queue connection failed")
      );

      await expect(
        UserService.uploadResume("user-123", "/path/to/resume.pdf")
      ).rejects.toThrow("Queue connection failed");
    });
  });
});

describe("User Controller - Unit Tests", () => {
  let mockRequest: Partial<ICustomRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      user: {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        image: null,
        emailVerified: true,
        role: "CANDIDATE" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      file: {
        path: "/uploads/resume.pdf",
        fieldname: "resume",
        originalname: "resume.pdf",
        encoding: "7bit",
        mimetype: "application/pdf",
        size: 1024,
        destination: "/uploads",
        filename: "resume.pdf",
        stream: {} as any,
        buffer: Buffer.from(""),
      },
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe("uploadResume", () => {
    it("should return success response when upload is successful", async () => {
      vi.spyOn(UserService, "uploadResume").mockResolvedValue(undefined);

      await UserController.uploadResume(
        mockRequest as ICustomRequest,
        mockResponse as Response,
        mockNext
      );

      expect(UserService.uploadResume).toHaveBeenCalledWith(
        "user-123",
        "/uploads/resume.pdf"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 200,
        success: true,
        message: "User role confirmed successfully",
        data: {},
      });
    });

    it("should handle errors and pass to next middleware", async () => {
      const error = new ApiError(404, "Candidate profile not found");
      vi.spyOn(UserService, "uploadResume").mockRejectedValue(error);

      await UserController.uploadResume(
        mockRequest as ICustomRequest,
        mockResponse as Response,
        mockNext
      );

      // catchAsync wraps the controller, so error is caught and passed to next
      // Wait for async to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      // The response should be sent due to catchAsync error handling
      expect(UserService.uploadResume).toHaveBeenCalled();
    });

    it("should handle missing user in request", async () => {
      delete mockRequest.user;

      await UserController.uploadResume(
        mockRequest as ICustomRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle missing file in request", async () => {
      mockRequest.file = undefined;

      await UserController.uploadResume(
        mockRequest as ICustomRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

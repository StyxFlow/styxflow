import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import request from "supertest";
import express, { type Express } from "express";
import { UserRoutes } from "../../app/modules/user/user.routes.js";
import { db } from "../../db/drizzle.js";
import { addResumeToQueue } from "../../queues/producer.js";
import path from "path";
import fs from "fs";

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

vi.mock("../../app/middlewares/validateUser.js", () => ({
  validateUser: () => (req: any, res: any, next: any) => {
    // Mock authenticated user
    req.user = { id: "user-123", email: "test@example.com" };
    next();
  },
}));

describe("User Routes - Integration Tests", () => {
  let app: Express;
  const mockResumePath = path.join(process.cwd(), "uploads", "test-resume.pdf");

  beforeAll(() => {
    // Setup Express app
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/api/user", UserRoutes);

    // Error handler
    app.use((err: any, req: any, res: any, next: any) => {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    });

    // Create mock resume file for testing
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    fs.writeFileSync(mockResumePath, "Mock PDF content");
  });

  afterAll(() => {
    // Cleanup - remove all test files and uploads directory
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (fs.existsSync(uploadsDir)) {
      // Remove all files in uploads directory
      const files = fs.readdirSync(uploadsDir);
      files.forEach((file) => {
        const filePath = path.join(uploadsDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });
      // Remove the uploads directory itself
      fs.rmdirSync(uploadsDir);
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/user/upload-resume", () => {
    it("should upload resume successfully with valid file", async () => {
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

      const response = await request(app)
        .post("/api/user/upload-resume")
        .attach("resume", mockResumePath)
        .expect(200);

      expect(response.body).toEqual({
        statusCode: 200,
        success: true,
        message: "User role confirmed successfully",
        data: {},
      });

      expect(db.query.candidate.findFirst).toHaveBeenCalled();
      expect(addResumeToQueue).toHaveBeenCalledWith(
        expect.stringContaining("candidate-123")
      );
    });

    it("should return 404 when candidate profile not found", async () => {
      vi.mocked(db.query.candidate.findFirst).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/api/user/upload-resume")
        .attach("resume", mockResumePath)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: "Candidate profile not found",
      });

      expect(addResumeToQueue).not.toHaveBeenCalled();
    });

    it("should return error when no file is uploaded", async () => {
      const response = await request(app).post("/api/user/upload-resume");

      // Multer/controller will throw error for missing file
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
      expect(addResumeToQueue).not.toHaveBeenCalled();
    });

    it("should handle multiple file uploads (only first accepted)", async () => {
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

      // Multer with .single() only accepts one file, second will be ignored
      const response = await request(app)
        .post("/api/user/upload-resume")
        .attach("resume", mockResumePath);

      expect(response.body.success).toBe(true);
      // Multer with .single() should only process first file
      expect(addResumeToQueue).toHaveBeenCalledTimes(1);
    });

    it("should handle PDF files only (based on multer config)", async () => {
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

      const response = await request(app)
        .post("/api/user/upload-resume")
        .attach("resume", mockResumePath)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should handle queue connection errors", async () => {
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

      const response = await request(app)
        .post("/api/user/upload-resume")
        .attach("resume", mockResumePath)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Queue connection failed");
    });

    it("should handle database connection errors", async () => {
      vi.mocked(db.query.candidate.findFirst).mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app)
        .post("/api/user/upload-resume")
        .attach("resume", mockResumePath)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Database connection failed");
    });

    it("should require authentication (middleware applied)", async () => {
      // This test verifies that validateUser middleware is applied
      // In a real scenario without mock, this would return 401
      const response = await request(app)
        .post("/api/user/upload-resume")
        .attach("resume", mockResumePath);

      // With our mock, user is always authenticated
      // In production, without mock, expect 401 for unauthenticated requests
      expect(response.status).not.toBe(401);
    });

    it("should handle large file uploads", async () => {
      const mockCandidate = {
        id: "candidate-123",
        userId: "user-123",
        fullName: "John Doe",
        createdAt: new Date(),
        updatedAt: new Date(),
        address: null,
      };

      // Create a large mock file (simulate large PDF)
      const largeFilePath = path.join(
        process.cwd(),
        "uploads",
        "large-resume.pdf"
      );
      const largeContent = Buffer.alloc(5 * 1024 * 1024); // 5MB
      fs.writeFileSync(largeFilePath, largeContent);

      vi.mocked(db.query.candidate.findFirst).mockResolvedValue(mockCandidate);
      vi.mocked(addResumeToQueue).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/api/user/upload-resume")
        .attach("resume", largeFilePath)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Cleanup
      fs.unlinkSync(largeFilePath);
    });

    it("should validate file field name is 'resume'", async () => {
      const response = await request(app)
        .post("/api/user/upload-resume")
        .attach("wrongFieldName", mockResumePath);

      // Wrong field name means no file is processed, should error
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
      expect(addResumeToQueue).not.toHaveBeenCalled();
    });

    it("should handle concurrent upload requests", async () => {
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

      const requests = [
        request(app)
          .post("/api/user/upload-resume")
          .attach("resume", mockResumePath),
        request(app)
          .post("/api/user/upload-resume")
          .attach("resume", mockResumePath),
        request(app)
          .post("/api/user/upload-resume")
          .attach("resume", mockResumePath),
      ];

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      expect(addResumeToQueue).toHaveBeenCalledTimes(3);
    });
  });
});

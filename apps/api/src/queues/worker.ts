import { Job, Worker } from "bullmq";
import { bullmqConnection } from "./index.js";
import path from "path";
import fs from "fs";
import * as pdfParse from "pdf-parse";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { getVectorStore } from "../db/qdrant.js";

// Handle ESM/CJS compatibility for pdf-parse
const pdf = (pdfParse as any).default || pdfParse;

const worker = new Worker(
  "resume-upload-queue",
  async (job: Job<{ queueData: string }>) => {
    console.log("Job received:", job.id);
    const { filePath, candidateId } = JSON.parse(job.data.queueData);
    console.log("worker is processing", filePath);

    // Read PDF file as buffer
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const parsedData = pdfData.text;

    const textSplitter = new CharacterTextSplitter({
      chunkSize: 300,
      chunkOverlap: 0,
    });
    const texts = await textSplitter.splitText(parsedData);
    const docs = texts.map(
      (t, idx) =>
        new Document({
          pageContent: t,
          metadata: {
            candidateId,
            chunkIndex: idx,
          },
        }),
    );

    const vectorStore = await getVectorStore();
    console.log("Vector store obtained, adding", docs.length, "documents...");
    try {
      await vectorStore.addDocuments(docs);
      console.log("all docs are added to vector database");
    } catch (err) {
      console.error("Error adding documents to Qdrant:", err);
      throw err;
    }
    const absolutePath = path.resolve(filePath);
    fs.unlink(absolutePath, (err) => {
      if (err) {
        console.error("Error deleting file:", absolutePath, err);
        return;
      }
    });
  },
  {
    connection: bullmqConnection,
    concurrency: 5,
  },
);

// Worker event handlers
worker.on("ready", () => {
  console.log("✅ Worker is ready and listening for jobs");
});

worker.on("active", (job) => {
  console.log(`🔄 Job ${job.id} has started processing`);
});

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

console.log("Worker script loaded, connecting to Redis...");

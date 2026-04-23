import { Job, Worker } from "bullmq";
import { bullmqConnection } from "./index.js";
import path from "path";
import fs from "fs";
import { PDFParse } from "pdf-parse";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { Document } from "@langchain/core/documents";
import { QdrantVectorStore } from "@langchain/qdrant";
import config from "../config/index.js";
import { getVectorStore } from "../db/qdrant.js";
import { Room, RoomEvent, TrackKind } from "@livekit/rtc-node";

const resume_worker = new Worker(
  "resume-upload-queue",
  async (job: Job<{ queueData: string }>) => {
    console.log("s");
    const { filePath, candidateId } = JSON.parse(job.data.queueData);
    console.log("worker is processing", filePath);

    const pdfParser = new PDFParse({ url: filePath });
    const parsedData = (await pdfParser.getText()).text;
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

const interviewer_connect_worker = new Worker(
  "interviewer-connect-queue",
  async (job: Job<{ queueData: string }>) => {
    const room = new Room();

    // Connect to the LiveKit Cloud room
    await room.connect(config.livekit.url!, config.livekit.server_token!);
    console.log("AI Interviewer joined the room!");

    // Listen for the candidate's audio track
    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === TrackKind.KIND_AUDIO) {
        console.log(`Receiving audio from ${participant.identity}`);

        // 🚀 THE MAGIC HAPPENS HERE:
        // 1. You take this 'track' stream
        // 2. You pipe it into your Gemini Multimodal Live API WebSocket
        // 3. You take Gemini's audio response and publish it back into the 'room'
      }
    });
  },
  {
    connection: bullmqConnection,
    concurrency: 5,
  },
);

// Resume worker event handlers
resume_worker.on("ready", () => {
  console.log("✅ Resume Worker is ready and listening for jobs");
});

resume_worker.on("active", (job) => {
  console.log(`🔄 Resume Job ${job.id} has started processing`);
});

resume_worker.on("completed", (job) => {
  console.log(`✅ Resume Job ${job.id} completed successfully`);
});

resume_worker.on("failed", (job, err) => {
  console.error(`❌ Resume Job ${job?.id} failed:`, err.message);
});

// Interviewer connect worker event handlers
interviewer_connect_worker.on("ready", () => {
  console.log("✅ Interviewer worker is ready and listening for jobs");
});

interviewer_connect_worker.on("active", (job) => {
  console.log(`🔄 Interviewer job ${job.id} has started processing`);
});

interviewer_connect_worker.on("completed", (job) => {
  console.log(`✅ Interviewer job ${job.id} completed successfully`);
});

interviewer_connect_worker.on("failed", (job, err) => {
  console.error(`❌ Interviewer job ${job?.id} failed:`, err.message);
});

console.log("Worker script loaded, connecting to Redis...");

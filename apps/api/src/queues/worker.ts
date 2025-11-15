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

const worker = new Worker(
  "resume-upload-queue",
  async (job: Job<{ queueData: string }>) => {
    const { filePath, candidateId } = JSON.parse(job.data.queueData);

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
        })
    );

    const vectorStore = await getVectorStore();
    await vectorStore.addDocuments(docs);
    console.log("all docs are added to vector database");
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
  }
);

import { readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

const datasetDirectory = path.resolve(import.meta.dirname, "../../dataset/resume");
const delayBetweenProviderRequestsMs = 1_000;

const extractors = [
  { name: "versapdf", delay: 0 },
  { name: "pdf2md", delay: 0 },
  { name: "pdf-parse", delay: 0 },
  { name: "llamaparse", delay: delayBetweenProviderRequestsMs },
  { name: "unstructured", delay: delayBetweenProviderRequestsMs },
];

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function runResumeExtractionEvaluation(): Promise<void> {
  const pdfFiles = (await readdir(datasetDirectory))
    .filter((fileName) => fileName.toLowerCase().endsWith(".pdf"))
    .sort();

  for (const { name, delay: requestDelay } of extractors) {
    for (const pdfFile of pdfFiles) {
      await runExtractorInChildProcess(name, path.join(datasetDirectory, pdfFile));
      if (requestDelay > 0) {
        await delay(requestDelay);
      }
    }
  }
}

function runExtractorInChildProcess(
  extractorName: string,
  pdfPath: string,
): Promise<void> {
  const workerPath = path.resolve(import.meta.dirname, "extractor_worker.ts");
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["--experimental-strip-types", workerPath, extractorName, pdfPath],
      { stdio: "inherit" },
    );
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${extractorName} worker exited with code ${code}`));
      }
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runResumeExtractionEvaluation();
}

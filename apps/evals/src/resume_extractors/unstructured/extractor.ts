import { readFile } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { TransformClient, isAccepted } from "unstructured-transform-client";
import { runAndRecord } from "../utils.ts";

dotenv.config({ path: path.resolve(import.meta.dirname, "../../../.env") });

const extractorName = "unstructured";
const recordsPath = path.resolve(
  import.meta.dirname,
  "../unstructured/unstructured_records.csv",
);
const client = new TransformClient({ timeoutMs: 60_000 });

export async function extractWithUnstructured(pdfPath: string): Promise<void> {
  const outputPath = path.resolve(
    import.meta.dirname,
    "output",
    `${path.basename(pdfPath, path.extname(pdfPath))}.md`,
  );
  await runAndRecord(extractorName, pdfPath, recordsPath, outputPath, async () => {
    const file = new File([await readFile(pdfPath)], path.basename(pdfPath));
    const response = await client.parse.run({
      input: file,
      waitSeconds: 30,
    });

    if (!isAccepted(response)) {
      return getMarkdown(response.body);
    }

    let job = await client.jobs.get(response.body.id);
    while (job.status === "queued" || job.status === "processing") {
      await new Promise((resolve) => setTimeout(resolve, 2_000));
      job = await client.jobs.get(response.body.id);
    }

    if (job.status !== "completed" && job.status !== "completed_with_warnings") {
      throw new Error(`Unstructured parse stopped with status: ${job.status}`);
    }
    return getMarkdown(job.result);
  });
}

function getMarkdown(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && value !== null && "markdown" in value) {
    const markdown = value.markdown;
    if (typeof markdown === "string") {
      return markdown;
    }
  }
  return JSON.stringify(value);
}

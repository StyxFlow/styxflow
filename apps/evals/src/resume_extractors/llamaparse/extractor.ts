import { readFile } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { runAndRecord } from "../utils.ts";

dotenv.config({ path: path.resolve(import.meta.dirname, "../../../.env") });

const extractorName = "llamaparse";
const recordsPath = path.resolve(
  import.meta.dirname,
  "../llamaparse/llamaparse_records.csv",
);

export async function extractWithLlamaParse(pdfPath: string): Promise<void> {
  const outputPath = path.resolve(
    import.meta.dirname,
    "output",
    `${path.basename(pdfPath, path.extname(pdfPath))}.md`,
  );
  await runAndRecord(
    extractorName,
    pdfPath,
    recordsPath,
    outputPath,
    async () => {
      const apiKey = process.env.LLAMA_CLOUD_API_KEY;
      if (!apiKey) {
        throw new Error("Missing LLAMA_CLOUD_API_KEY");
      }

      const file = new Blob([await readFile(pdfPath)]);
      const form = new FormData();
      form.append("file", file, path.basename(pdfPath));
      form.append(
        "configuration",
        JSON.stringify({ tier: "fast", version: "latest" }),
      );

      const uploadResponse = await fetch(
        "https://api.cloud.llamaindex.ai/api/v2/parse/upload",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: form,
        },
      );
      const uploadBody = await readJsonResponse(uploadResponse);
      const jobId = getString(uploadBody, "id");
      if (!jobId) {
        throw new Error("LlamaParse did not return a parse job id");
      }

      for (let attempt = 0; attempt < 180; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1_000));
        const resultResponse = await fetch(
          `https://api.cloud.llamaindex.ai/api/v2/parse/${jobId}?expand=markdown_full,markdown`,
          { headers: { Authorization: `Bearer ${apiKey}` } },
        );
        const resultBody = await readJsonResponse(resultResponse);
        const job = asRecord(resultBody.job) ?? resultBody;
        const status = getString(job, "status");
        if (status === "FAILED" || status === "ERROR" || status === "CANCELLED") {
          throw new Error(
            getString(job, "error_message") ??
              `LlamaParse job ended with status ${status}`,
          );
        }
        if (status === "COMPLETED" || status === "SUCCESS") {
          return getMarkdown(resultBody);
        }
      }

      throw new Error("LlamaParse timed out while waiting for the parse job");
    },
  );
}

type JsonRecord = Record<string, unknown>;

async function readJsonResponse(response: Response): Promise<JsonRecord> {
  const body = await response.text();
  if (!response.ok) {
    const error = new Error(`LlamaParse API error (${response.status}): ${body}`);
    Object.assign(error, { status: response.status });
    throw error;
  }
  return JSON.parse(body) as JsonRecord;
}

function getString(value: JsonRecord, key: string): string | undefined {
  return typeof value[key] === "string" ? value[key] : undefined;
}

function asRecord(value: unknown): JsonRecord | undefined {
  return typeof value === "object" && value !== null
    ? (value as JsonRecord)
    : undefined;
}

function getMarkdown(body: JsonRecord): string {
  if (typeof body.markdown_full === "string") {
    return body.markdown_full;
  }
  if (typeof body.markdown === "string") {
    return body.markdown;
  }
  if (Array.isArray(body.markdown)) {
    return body.markdown
      .map((page: unknown) =>
        typeof page === "object" &&
        page !== null &&
        "markdown" in page &&
        typeof page.markdown === "string"
          ? page.markdown
          : "",
      )
      .filter(Boolean)
      .join("\n\n");
  }
  return "";
}

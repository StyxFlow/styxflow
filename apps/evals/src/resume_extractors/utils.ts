import { appendFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export interface ExtractionMetrics {
  extractor: string;
  pdf: string;
  latencyMs: number;
  error: string;
  rateLimited: boolean;
  outputPath: string;
  timestamp: string;
}

export type Extractor = (pdfPath: string) => Promise<void>;

const csvHeader =
  "extractor,pdf,latencyMs,error,rateLimited,outputPath,timestamp\n";

export function isRateLimitError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    const candidate = error as { status?: number; statusCode?: number };
    if (candidate.status === 429 || candidate.statusCode === 429) {
      return true;
    }
  }

  const message = error instanceof Error ? error.message : String(error);
  return /\b429\b|rate.?limit|too many requests/i.test(message);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function csvEscape(value: string | number | boolean): string {
  const stringValue = String(value);
  return /[",\n]/.test(stringValue)
    ? `"${stringValue.replaceAll('"', '""')}"`
    : stringValue;
}

export async function writeExtractionOutput(
  outputPath: string,
  content: string,
): Promise<void> {
  const meaningfulContent = content
    .replace(/--\s+\d+\s+of\s+\d+\s+--/g, "")
    .trim();
  if (!meaningfulContent) {
    throw new Error("Extractor returned empty output");
  }
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content, "utf8");
}

export async function recordMetrics(
  recordsPath: string,
  metrics: ExtractionMetrics,
): Promise<void> {
  await mkdir(path.dirname(recordsPath), { recursive: true });
  const headerExists = await import("node:fs/promises").then(async ({ access }) => {
    try {
      await access(recordsPath);
      return true;
    } catch {
      return false;
    }
  });
  const row = [
    metrics.extractor,
    metrics.pdf,
    metrics.latencyMs,
    metrics.error,
    metrics.rateLimited,
    metrics.outputPath,
    metrics.timestamp,
  ]
    .map(csvEscape)
    .join(",");
  await appendFile(recordsPath, `${headerExists ? "" : csvHeader}${row}\n`, "utf8");
}

export async function runAndRecord(
  extractor: string,
  pdfPath: string,
  recordsPath: string,
  outputPath: string,
  extract: () => Promise<string>,
): Promise<void> {
  const startedAt = performance.now();
  let error = "";
  let rateLimited = false;

  try {
    const content = await extract();
    await writeExtractionOutput(outputPath, content);
  } catch (caughtError) {
    error = errorMessage(caughtError);
    rateLimited = isRateLimitError(caughtError);
  }

  await recordMetrics(recordsPath, {
    extractor,
    pdf: path.basename(pdfPath),
    latencyMs: Math.round(performance.now() - startedAt),
    error,
    rateLimited,
    outputPath,
    timestamp: new Date().toISOString(),
  });
}

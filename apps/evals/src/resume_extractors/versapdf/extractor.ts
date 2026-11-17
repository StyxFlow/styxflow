import { readFile } from "node:fs/promises";
import path from "node:path";
import { pdfToMarkdown } from "@versapdf/pdf-to-markdown";
import { runAndRecord } from "../utils.ts";

const extractorName = "versapdf";
const recordsPath = path.resolve(import.meta.dirname, "../versapdf/versapdf_records.csv");

export async function extractWithVersaPdf(pdfPath: string): Promise<void> {
  const outputPath = path.resolve(
    import.meta.dirname,
    "output",
    `${path.basename(pdfPath, path.extname(pdfPath))}.md`,
  );
  await runAndRecord(extractorName, pdfPath, recordsPath, outputPath, async () =>
    pdfToMarkdown(new Uint8Array(await readFile(pdfPath))),
  );
}

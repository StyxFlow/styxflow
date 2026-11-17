import { readFile } from "node:fs/promises";
import path from "node:path";
import pdf2md from "pdf2md-ts";
import { runAndRecord } from "../utils.ts";

const extractorName = "pdf2md";
const recordsPath = path.resolve(import.meta.dirname, "../pdf2md/pdf2md_records.csv");

export async function extractWithPdf2Md(pdfPath: string): Promise<void> {
  const outputPath = path.resolve(
    import.meta.dirname,
    "output",
    `${path.basename(pdfPath, path.extname(pdfPath))}.md`,
  );
  await runAndRecord(extractorName, pdfPath, recordsPath, outputPath, async () =>
    (await pdf2md(await readFile(pdfPath))).join("\n\n"),
  );
}

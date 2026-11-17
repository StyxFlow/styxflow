import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import { runAndRecord } from "../utils.ts";

const extractorName = "pdf-parse";
const recordsPath = path.resolve(
  import.meta.dirname,
  "../pdf_parse/pdf-parse_records.csv",
);

export async function extractWithPdfParse(pdfPath: string): Promise<void> {
  const outputPath = path.resolve(
    import.meta.dirname,
    "output",
    `${path.basename(pdfPath, path.extname(pdfPath))}.md`,
  );
  await runAndRecord(extractorName, pdfPath, recordsPath, outputPath, async () => {
    const parser = new PDFParse({ data: await readFile(pdfPath) });
    try {
      return (await parser.getText()).text;
    } finally {
      await parser.destroy();
    }
  });
}

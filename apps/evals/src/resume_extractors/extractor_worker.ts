const [extractorName, pdfPath] = process.argv.slice(2);

if (!extractorName || !pdfPath) {
  throw new Error("Expected an extractor name and PDF path");
}

switch (extractorName) {
  case "versapdf":
    await (await import("./versapdf/extractor.ts")).extractWithVersaPdf(pdfPath);
    break;
  case "pdf2md":
    await (await import("./pdf2md/extractor.ts")).extractWithPdf2Md(pdfPath);
    break;
  case "pdf-parse":
    await (await import("./pdf_parse/extractor.ts")).extractWithPdfParse(pdfPath);
    break;
  case "llamaparse":
    await (await import("./llamaparse/extractor.ts")).extractWithLlamaParse(pdfPath);
    break;
  case "unstructured":
    await (await import("./unstructured/extractor.ts")).extractWithUnstructured(
      pdfPath,
    );
    break;
  default:
    throw new Error(`Unknown extractor: ${extractorName}`);
}

import wav from "wav";

export function pcmToWavBuffer(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter("ignored.wav", {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const chunks: Buffer[] = [];
    writer.on("data", (chunk: Buffer) => chunks.push(chunk));
    writer.on("finish", () => resolve(Buffer.concat(chunks)));
    writer.on("error", reject);

    writer.write(pcmData);
    writer.end();
  });
}

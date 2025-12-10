// import { GoogleGenAI } from "@google/genai";
// import config from "../config/index.js";
// import { pcmToWavBuffer } from "../app/modules/interview/interview.utils.js";

// export const gemini = new GoogleGenAI({
//   apiKey: config.google_genai_api_key!,
// });

// export const geminiTTS = async (content: string) => {
//   const speechResponse = await gemini.models.generateContent({
//     model: "gemini-2.5-flash-preview-tts",
//     contents: [
//       {
//         parts: [
//           {
//             text: `Say like you are interested: ${content}`,
//           },
//         ],
//       },
//     ],
//     config: {
//       responseModalities: ["AUDIO"],
//       speechConfig: {
//         voiceConfig: {
//           prebuiltVoiceConfig: { voiceName: "Kore" },
//         },
//       },
//     },
//   });

//   // console.log(speechResponse);
//   const part = speechResponse.candidates?.[0]?.content?.parts?.[0];
//   const inline = part?.inlineData;

//   if (!inline?.data) {
//     return null;
//   }

//   const pcmBase64 = inline.data;
//   const pcmBuffer = Buffer.from(pcmBase64, "base64");

//   const wavBuffer = await pcmToWavBuffer(pcmBuffer, 1, 24000, 2);
//   // await fs.promises.writeFile("out.wav", wavBuffer);
//   const wavBase64 = wavBuffer.toString("base64");
//   return wavBase64;
// };

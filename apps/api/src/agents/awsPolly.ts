// import {
//   LanguageCode,
//   PollyClient,
//   SynthesizeSpeechCommand,
//   VoiceId,
// } from "@aws-sdk/client-polly";
// import config from "../config/index.js";

// const pollyClient = new PollyClient({
//   region: "ap-south-1",
//   credentials: {
//     accessKeyId: config.aws.access_key_id!,
//     secretAccessKey: config.aws.secret_access_key!,
//   },
// });

// // Function to synthesize speech
// async function synthesizeSpeech(
//   text: string,
//   voiceId: string,
//   LanguageCode: string
// ) {
//   try {
//     const command = new SynthesizeSpeechCommand({
//       Text: text,
//       OutputFormat: "mp3",
//       Engine: "neural",
//       LanguageCode: (LanguageCode as LanguageCode) || "en-US",
//       VoiceId: (voiceId as VoiceId) || "Joanna",
//     });

//     const response = await pollyClient.send(command);

//     // The audio stream is in response.AudioStream
//     return response.AudioStream;
//   } catch (error) {
//     console.error("Error synthesizing speech:", error);
//     throw error;
//   }
// }

// // Usage example
// export async function convertTextToSpeech(
//   text: string,
//   { voiceId, LanguageCode }: { voiceId: string; LanguageCode: string }
// ) {
//   try {
//     const audioStream = await synthesizeSpeech(text, voiceId, LanguageCode);
//     let buffer: Buffer;

//     if (audioStream instanceof Uint8Array) {
//       buffer = Buffer.from(audioStream);
//     } else if (Buffer.isBuffer(audioStream)) {
//       buffer = audioStream as Buffer;
//     } else {
//       const chunks: Buffer[] = [];
//       for await (const chunk of audioStream as any) {
//         chunks.push(Buffer.from(chunk));
//       }
//       buffer = Buffer.concat(chunks);
//     }
//     // console.log("inside polly --> ", buffer);

//     return buffer.toString("base64");
//   } catch (error) {
//     console.error("Failed to convert text to speech:", error);
//   }
// }

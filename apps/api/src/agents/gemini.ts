import { GoogleGenAI } from "@google/genai";
import config from "../config/index.js";

export const gemini = new GoogleGenAI({
  apiKey: config.google_genai_api_key!,
});

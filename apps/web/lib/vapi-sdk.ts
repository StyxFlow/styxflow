import { config } from "@/config";
import Vapi from "@vapi-ai/web";

export const vapi = new Vapi(config.vapi_public_key!)
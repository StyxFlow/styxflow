import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV || "development",
  client_url:
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL_HOSTED
      : process.env.CLIENT_URL,
  server_url:
    process.env.NODE_ENV === "production"
      ? process.env.SERVER_URL_HOSTED
      : process.env.SERVER_URL,
  port: process.env.PORT,
  database_url:
    process.env.NODE_ENV === "production"
      ? process.env.DATABASE_URL
      : process.env.DATABASE_URL_DEV,
  better_token_key:
    process.env.NODE_ENV === "production"
      ? process.env.BETTER_AUTH_TOKEN_KEY_PROD
      : process.env.BETTER_AUTH_TOKEN_KEY_DEV,
  redis: {
    host:
      process.env.NODE_ENV === "production"
        ? process.env.REDIS_HOST
        : process.env.REDIS_HOST_DEV,
    port:
      process.env.NODE_ENV === "production"
        ? process.env.REDIS_PORT
        : process.env.REDIS_PORT_DEV,
    password:
      process.env.NODE_ENV === "production"
        ? process.env.REDIS_PASSWORD
        : undefined,
    username:
      process.env.NODE_ENV === "production"
        ? process.env.REDIS_USERNAME
        : undefined,
  },
  qdrant: {
    key: process.env.QDRANT_KEY,
    url: process.env.QDRANT_URL,
  },
  huggingface: {
    api_key: process.env.HUGGINGFACE_API_KEY,
  },
  aws: {
    access_key_id: process.env.AWS_ACCESS_KEY,
    secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  },
  groq_api_key: process.env.GROQ_API_KEY,
  google_genai_api_key: process.env.GOOGLE_GENAI_API_KEY,
  livekit: {
    url: process.env.LIVEKIT_URL,
    api_key: process.env.LIVEKIT_API_KEY,
    api_secret: process.env.LIVEKIT_API_SECRET,
  },
};

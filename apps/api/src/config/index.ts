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
  database_url: process.env.DATABASE_URL,
  better_token_key:
    process.env.NODE_ENV === "production"
      ? process.env.BETTER_AUTH_TOKEN_KEY_PROD
      : process.env.BETTER_AUTH_TOKEN_KEY_DEV,
  // cloudinary: {
  //   api_key: process.env.CLOUDINARY_API_KEY,
  //   api_secret: process.env.CLOUDINARY_API_SECRET,
  //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  // },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
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
};

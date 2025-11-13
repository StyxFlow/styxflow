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
  better_token_key: process.env.BETTER_AUTH_TOKEN_KEY,
  // cloudinary: {
  //   api_key: process.env.CLOUDINARY_API_KEY,
  //   api_secret: process.env.CLOUDINARY_API_SECRET,
  //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  // },
  // redis: {
  //   host: process.env.REDIS_HOST,
  //   port: process.env.REDIS_PORT,
  //   password: process.env.REDIS_PASSWORD,
  //   url: process.env.REDIS_URL,
  //   token: process.env.REDIS_TOKEN,
  // },
  // groq_api_key: process.env.GROQ_API_KEY,
  // admin: {
  //   email: process.env.ADMIN_EMAIL,
  //   password: process.env.ADMIN_PASSWORD,
  //   name: process.env.ADMIN_NAME,
  // },
  // sslcommerz: {
  //   store_id: process.env.SSLCOMMERZ_STORE_ID,
  //   store_password: process.env.SSLCOMMERZ_STORE_PASSWORD,
  //   payment_api: process.env.SSL_PAYMENT_API,
  //   success_url: process.env.SUCCESS_URL_DEVELOPMENT,
  //   fail_url: process.env.FAIL_URL_DEVELOPMENT,
  //   cancel_url: process.env.CANCEL_URL_DEVELOPMENT,
  //   validation_api: process.env.SSL_VALIDATION_API,
  // },
};

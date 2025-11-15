import app from "./app.js";
import config from "./config/index.js";
import { createServer } from "http";
import { connectRedis } from "./db/redis.js";

const server = createServer(app);

const PORT = config.port || 8000;

const main = async () => {
  try {
    console.log("Starting server...");
    await connectRedis();
    console.log("Redis connected successfully");

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("FATAL server startup error:");
    console.error("Type:", typeof error);
    console.error("Value:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
};

main();

// Global error handlers to catch unhandled errors
process.on("uncaughtException", (error) => {
  console.error("❌ UNCAUGHT EXCEPTION:");
  console.error("Type:", typeof error);
  console.error("Value:", error);
  if (error instanceof Error) {
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
  }
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ UNHANDLED REJECTION at:", promise);
  console.error("Reason:", reason);
  process.exit(1);
});

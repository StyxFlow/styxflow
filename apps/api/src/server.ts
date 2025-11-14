import app from "./app.js";
import config from "./config/index.js";
import { createServer } from "http";
import { connectRedis } from "./db/redis.js";

const server = createServer(app);

const PORT = config.port || 8000;

const main = async () => {
  try {
    await connectRedis();
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

main();

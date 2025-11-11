import app from "./app.js";
import config from "./config/index.js";
import { createServer } from "http";

const server = createServer(app);

const PORT = config.port || 8000;

const main = async () => {
  try {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

main();

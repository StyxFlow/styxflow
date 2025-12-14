import express from "express";
import cors from "cors";
import IndexRoute from "./routes/index.js";
import globalErrorHandler from "./app/middlewares/globalErrorHandler.js";
import config from "./config/index.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.client_url,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

// test route
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "StyxFlow server is running like a charm! 🚀" });
});

app.use("/api/v1", IndexRoute);

app.use(globalErrorHandler);

app.use((req, res) => {
  console.log(`404 Not Found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Not Found",
  });
});

export default app;

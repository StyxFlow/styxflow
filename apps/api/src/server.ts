import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to StyxFlow API",
  });
});

app.listen(8000, () => {
  console.log("API Server is running on http://localhost:8000");
});

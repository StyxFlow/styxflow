import multer from "multer";
import path from "path";
import fs from "fs";

// Use /app/uploads in production (Docker), or local uploads folder in development
const uploadsDir = process.env.NODE_ENV === "production" 
  ? "/app/uploads"
  : path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

console.log("Multer uploads directory:", uploadsDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage: storage });

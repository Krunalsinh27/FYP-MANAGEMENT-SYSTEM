import express from "express";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.js";
// import authRouter from "./router/userRoutes.js";
import authRouter from "./router/authRoutes.js";
import adminRouter from "./router/adminRoutes.js";
import studentRouter from "./router/studentRoutes.js";
import notificationRouter from "./router/notificationRoutes.js";
import projectRouter from "./router/projectRoutes.js";
import deadlineRouter from "./router/deadlineRoutes.js";
import teacherRouter from "./router/teacherRoutes.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://fyp-management-system-n0s8.onrender.com"
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    try {
      const url = new URL(origin);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return callback(null, true);
      }
    } catch (err) {
      // ignore
    }
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FYP Management System Backend is Running 🚀",
  });
});

const uploadsDir = path.join(__dirname, "uploads");
const tempDir = path.join(__dirname, "temp");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/deadline", deadlineRouter);
app.use("/api/v1/teacher", teacherRouter);

app.use(errorMiddleware);

export default app;


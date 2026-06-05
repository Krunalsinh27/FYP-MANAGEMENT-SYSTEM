import express from "express";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.js";
import authRouter from "./router/userRoutes.js";
import adminRouter from "./router/adminRoutes.js";
import studentRouter from "./router/studentRoutes.js";
import notificationRouter from "./router/notificationRoutes.js";
import projectRouter from "./router/projectRoutes.js";
import deadlineRouter from "./router/deadlineRoutes.js";
import {fileURLToPath} from "url";
import path from "path";
import fs from "fs";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // allow non-browser requests like curl
        // allow configured frontend origin
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // allow any localhost or 127.0.0.1 origin on any port for development
        try {
            const url = new URL(origin);
            if ((url.hostname === 'localhost' || url.hostname === '127.0.0.1')) return callback(null, true);
        } catch (err) {
            // ignore parse errors
        }
        return callback(new Error('CORS policy: Origin not allowed'));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

const uploadsDir = path.join(__dirname, "uploads");
const tempDir = path.join(__dirname, "temp");

if(!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, {recursive: true});
if(!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, {recursive: true});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/deadline", deadlineRouter);

app.use(errorMiddleware);

export default app;


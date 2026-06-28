import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import teamRoutes from "./routes/teamRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const configuredOrigins = String(process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([clientUrl, "http://localhost:5173", "http://127.0.0.1:5173", ...configuredOrigins]);
const vercelPreviewPattern = /^https:\/\/[a-z0-9-]+(?:-[a-z0-9-]+)?\.vercel\.app$/i;

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      if (process.env.ALLOW_VERCEL_PREVIEWS === "true" && vercelPreviewPattern.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "task-tracker-api" });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/team", teamRoutes);
app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error.message);
    process.exit(1);
  });

import express from "express";
const session: any = require("express-session");
import dotenv from "dotenv";
import { initDb } from "./utils/db";
import authRoutes from "./routes/auth";
import tableRoutes from "./routes/table";
import resumeRoutes from "./routes/resume";
import projectsRoutes from "./routes/projects";
import newsRoutes from "./routes/news";

dotenv.config();

const app = express();

initDb().catch((err) => {
  console.error("Failed to initialize database:", err);
});

app.use((req, res, next) => {
  const origin = process.env.CORS_ORIGIN || req.headers.origin;
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: "50mb" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/auth", authRoutes);
app.use("/table", tableRoutes);
app.use("/resume", resumeRoutes);
app.use("/projects", projectsRoutes);
app.use("/news", newsRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

export default app;
import express from "express";
const session: any = require("express-session");
import dotenv from "dotenv";
import { initDb } from "./utils/db";
import { NeonSessionStore } from "./utils/sessionStore";
import authRoutes from "./routes/auth";
import tableRoutes from "./routes/table";
import resumeRoutes from "./routes/resume";
import projectsRoutes from "./routes/projects";
import newsRoutes from "./routes/news";
import configRoutes from "./routes/config";

dotenv.config();

const app = express();

initDb().catch((err) => {
  console.error("Failed to initialize database:", err);
});

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean) as string[];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
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

const isProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    store: new NeonSessionStore(),
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use("/auth", authRoutes);
app.use("/table", tableRoutes);
app.use("/resume", resumeRoutes);
app.use("/projects", projectsRoutes);
app.use("/news", newsRoutes);
app.use("/config", configRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

export default app;

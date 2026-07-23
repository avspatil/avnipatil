"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const session = require("express-session");
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./utils/db");
const sessionStore_1 = require("./utils/sessionStore");
const auth_1 = __importDefault(require("./routes/auth"));
const table_1 = __importDefault(require("./routes/table"));
const resume_1 = __importDefault(require("./routes/resume"));
const projects_1 = __importDefault(require("./routes/projects"));
const news_1 = __importDefault(require("./routes/news"));
const config_1 = __importDefault(require("./routes/config"));
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, db_1.initDb)().catch((err) => {
    console.error("Failed to initialize database:", err);
});
const allowedOrigins = [
    process.env.CORS_ORIGIN,
    "https://avnipatil.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3001",
].filter(Boolean);
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
app.use(express_1.default.json({ limit: "50mb" }));
const isProduction = process.env.NODE_ENV === "production";
app.use(session({
    store: new sessionStore_1.NeonSessionStore(),
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        maxAge: 24 * 60 * 60 * 1000,
    },
}));
app.use("/auth", auth_1.default);
app.use("/table", table_1.default);
app.use("/resume", resume_1.default);
app.use("/projects", projects_1.default);
app.use("/news", news_1.default);
app.use("/config", config_1.default);
app.get("/", (req, res) => {
    res.send("API running");
});
exports.default = app;

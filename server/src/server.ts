import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import tableRoutes from "./routes/table";

dotenv.config();

const app = express();


app.use("/auth", authRoutes);
app.use("/table", tableRoutes);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
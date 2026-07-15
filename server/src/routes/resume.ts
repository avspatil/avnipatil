import { Router } from "express";
import db from "../utils/db";

const router = Router();

router.get("/", (req, res) => {
  const row = db.prepare("SELECT * FROM resume WHERE id = 1").get() as any;
  if (!row) return res.json({ url: "" });
  res.json({ url: row.url || "" });
});

router.post("/", (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string" || !url.trim()) {
    return res.status(400).json({ error: "Missing or empty URL" });
  }
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }
  db.prepare(
    "INSERT INTO resume (id, url) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET url = excluded.url"
  ).run(url.trim());
  res.json({ success: true });
});

router.delete("/", (req, res) => {
  db.prepare("DELETE FROM resume WHERE id = 1").run();
  res.json({ success: true });
});

export default router;

import { Router } from "express";
import db from "../utils/db";

const router = Router();

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM news ORDER BY created_at DESC").all();
  res.json(rows);
});

router.post("/", (req, res) => {
  const { id, date, title, tag, tag_color } = req.body;
  if (!id || !title) return res.status(400).json({ error: "Missing id or title" });
  db.prepare(
    "INSERT INTO news (id, date, title, tag, tag_color) VALUES (?, ?, ?, ?, ?)"
  ).run(id, date || "", title, tag || "", tag_color || "#000000");
  res.json({ success: true });
});

router.put("/:id", (req, res) => {
  const { date, title, tag, tag_color } = req.body;
  db.prepare(
    "UPDATE news SET date = ?, title = ?, tag = ?, tag_color = ? WHERE id = ?"
  ).run(date, title, tag, tag_color, req.params.id);
  res.json({ success: true });
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM news WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

export default router;

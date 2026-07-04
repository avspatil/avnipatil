import { Router } from "express";
import db from "../utils/db";

const router = Router();

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM projects ORDER BY sort_order ASC, created_at ASC").all() as any[];
  res.json(rows.map((r) => ({ ...r, links: JSON.parse(r.links) })));
});

router.post("/", (req, res) => {
  const { id, title, author, description, date, links } = req.body;
  if (!id || !title) return res.status(400).json({ error: "Missing id or title" });
  const sort_order = (db.prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM projects").get() as any).next;
  db.prepare(
    "INSERT INTO projects (id, title, author, description, date, links, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(id, title, author || "", description || "", date || "", JSON.stringify(links || []), sort_order);
  res.json({ success: true });
});

router.put("/:id", (req, res) => {
  const { title, author, description, date, links } = req.body;
  db.prepare(
    "UPDATE projects SET title = ?, author = ?, description = ?, date = ?, links = ? WHERE id = ?"
  ).run(title, author, description, date, JSON.stringify(links || []), req.params.id);
  res.json({ success: true });
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.put("/reorder/:id", (req, res) => {
  const { sort_order } = req.body;
  db.prepare("UPDATE projects SET sort_order = ? WHERE id = ?").run(sort_order, req.params.id);
  res.json({ success: true });
});

export default router;

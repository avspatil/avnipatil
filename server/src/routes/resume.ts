import { Router } from "express";
import db from "../utils/db";

const router = Router();

router.get("/", (req, res) => {
  const row = db.prepare("SELECT * FROM resume WHERE id = 1").get() as any;
  if (!row) return res.json({ pdf: null, name: null });
  res.json({ pdf: row.pdf, name: row.name });
});

router.get("/pdf", (req, res) => {
  const row = db.prepare("SELECT * FROM resume WHERE id = 1").get() as any;
  if (!row) {
    return res.status(404).send("No resume uploaded");
  }
  const parts = row.pdf.split(",");
  const mime = parts[0].split(":")[1].split(";")[0];
  const buf = Buffer.from(parts[1], "base64");
  res.set("Content-Type", mime);
  res.set("Content-Disposition", `inline; filename="${row.name}"`);
  res.send(buf);
});

router.post("/", (req, res) => {
  const { pdf, name } = req.body;
  if (!pdf || !name) {
    return res.status(400).json({ error: "Missing pdf or name" });
  }
  db.prepare(
    "INSERT INTO resume (id, pdf, name) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET pdf = excluded.pdf, name = excluded.name"
  ).run(pdf, name);
  res.json({ success: true });
});

router.delete("/", (req, res) => {
  db.prepare("DELETE FROM resume WHERE id = 1").run();
  res.json({ success: true });
});

export default router;

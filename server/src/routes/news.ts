import { Router } from "express";
import sql from "../utils/db";

const router = Router();

router.get("/", async (req, res) => {
  const rows = await sql`SELECT * FROM news ORDER BY created_at DESC`;
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { id, date, title, tag, tag_color } = req.body;
  if (!id || !title) return res.status(400).json({ error: "Missing id or title" });
  await sql`
    INSERT INTO news (id, date, title, tag, tag_color)
    VALUES (${id}, ${date || ""}, ${title}, ${tag || ""}, ${tag_color || "#000000"})
  `;
  res.json({ success: true });
});

router.put("/:id", async (req, res) => {
  const { date, title, tag, tag_color } = req.body;
  await sql`
    UPDATE news SET date = ${date}, title = ${title}, tag = ${tag}, tag_color = ${tag_color}
    WHERE id = ${req.params.id}
  `;
  res.json({ success: true });
});

router.delete("/:id", async (req, res) => {
  await sql`DELETE FROM news WHERE id = ${req.params.id}`;
  res.json({ success: true });
});

export default router;

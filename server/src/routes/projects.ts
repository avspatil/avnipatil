import { Router } from "express";
import sql from "../utils/db";

const router = Router();

router.get("/", async (req, res) => {
  const rows = await sql`SELECT * FROM projects ORDER BY sort_order ASC, created_at ASC`;
  res.json(rows.map((r) => ({ ...r, links: JSON.parse(r.links as string) })));
});

router.post("/", async (req, res) => {
  const { id, title, author, description, date, links } = req.body;
  if (!id || !title) return res.status(400).json({ error: "Missing id or title" });
  const result = await sql`SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM projects`;
  const sort_order = result[0].next;
  await sql`
    INSERT INTO projects (id, title, author, description, date, links, sort_order)
    VALUES (${id}, ${title}, ${author || ""}, ${description || ""}, ${date || ""}, ${JSON.stringify(links || [])}, ${sort_order})
  `;
  res.json({ success: true });
});

router.put("/:id", async (req, res) => {
  const { title, author, description, date, links } = req.body;
  await sql`
    UPDATE projects SET title = ${title}, author = ${author}, description = ${description},
    date = ${date}, links = ${JSON.stringify(links || [])} WHERE id = ${req.params.id}
  `;
  res.json({ success: true });
});

router.delete("/:id", async (req, res) => {
  await sql`DELETE FROM projects WHERE id = ${req.params.id}`;
  res.json({ success: true });
});

router.put("/reorder/:id", async (req, res) => {
  const { sort_order } = req.body;
  await sql`UPDATE projects SET sort_order = ${sort_order} WHERE id = ${req.params.id}`;
  res.json({ success: true });
});

export default router;

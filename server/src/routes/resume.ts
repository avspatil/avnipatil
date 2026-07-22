import { Router } from "express";
import { getSql } from "../utils/db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  const rows = await getSql`SELECT * FROM resume WHERE id = 1`;
  if (rows.length === 0) return res.json({ url: "" });
  res.json({ url: rows[0].url || "" });
});

router.post("/", requireAuth, async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string" || !url.trim()) {
    return res.status(400).json({ error: "Missing or empty URL" });
  }
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }
  await getSql`
    INSERT INTO resume (id, url) VALUES (1, ${url.trim()})
    ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url
  `;
  res.json({ success: true });
});

router.delete("/", requireAuth, async (req, res) => {
  await getSql`DELETE FROM resume WHERE id = 1`;
  res.json({ success: true });
});

export default router;

import { Router } from "express";
import { getSql } from "../utils/db";

const router = Router();

router.get("/", async (req, res) => {
  const rows = await getSql`SELECT key, value FROM site_config`;
  const config: Record<string, string> = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }
  res.json(config);
});

router.post("/", async (req, res) => {
  const { key, value } = req.body;
  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "Missing key" });
  }
  await getSql`
    INSERT INTO site_config (key, value) VALUES (${key}, ${value || ""})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
  res.json({ success: true });
});

export default router;

import { Router } from "express";
import { getSql } from "../utils/db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", async (_req, res) => {
  const rows = await getSql`SELECT id, url, pdf_filename, (pdf_data IS NOT NULL) AS has_pdf FROM resume WHERE id = 1`;
  if (rows.length === 0) return res.json({ url: "", hasPdf: false, filename: "" });
  const row = rows[0];
  res.json({
    url: row.url || "",
    hasPdf: row.has_pdf === true || row.has_pdf === "t",
    filename: row.pdf_filename || "",
  });
});

router.get("/download", async (_req, res) => {
  const rows = await getSql`SELECT pdf_data, pdf_filename FROM resume WHERE id = 1`;
  if (rows.length === 0 || !rows[0].pdf_data) {
    return res.status(404).json({ error: "No resume uploaded" });
  }
  const filename = rows[0].pdf_filename || "resume.pdf";
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  const data = rows[0].pdf_data;
  if (typeof data === "string") {
    const buf = Buffer.from(data, "hex");
    res.send(buf);
  } else if (data instanceof Uint8Array) {
    res.send(Buffer.from(data));
  } else {
    res.send(Buffer.from(data as string, "hex"));
  }
});

router.post("/upload", requireAuth, async (req, res) => {
  const { file, filename } = req.body;

  if (!file || typeof file !== "string") {
    return res.status(400).json({ error: "Missing file data" });
  }

  const base64 = file.replace(/^data:application\/pdf;base64,/, "");
  const pdfBuffer = Buffer.from(base64, "base64");

  if (pdfBuffer.length < 4 || pdfBuffer.toString("ascii", 0, 4) !== "%PDF") {
    return res.status(400).json({ error: "Invalid PDF file" });
  }

  const safeFilename = (typeof filename === "string" && filename.trim()) || "resume.pdf";

  await getSql`
    INSERT INTO resume (id, pdf_data, pdf_filename) VALUES (1, ${pdfBuffer}, ${safeFilename})
    ON CONFLICT (id) DO UPDATE SET pdf_data = EXCLUDED.pdf_data, pdf_filename = EXCLUDED.pdf_filename
  `;

  res.json({ success: true, filename: safeFilename });
});

router.delete("/", requireAuth, async (_req, res) => {
  await getSql`UPDATE resume SET pdf_data = NULL, pdf_filename = NULL WHERE id = 1`;
  await getSql`UPDATE resume SET url = '' WHERE id = 1`;
  res.json({ success: true });
});

export default router;

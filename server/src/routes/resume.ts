import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.join(PROJECT_ROOT, "src", "data");
const RESUME_FILE = path.join(DATA_DIR, "resume.json");

function readResume(): { pdf: string; name: string } | null {
  try {
    return JSON.parse(fs.readFileSync(RESUME_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function writeResume(data: { pdf: string; name: string }) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(RESUME_FILE, JSON.stringify(data, null, 2));
}

function deleteResume() {
  try {
    fs.unlinkSync(RESUME_FILE);
  } catch {}
}

router.get("/", (req, res) => {
  const resume = readResume();
  if (!resume) {
    return res.json({ pdf: null, name: null });
  }
  res.json(resume);
});

router.post("/", (req, res) => {
  const { pdf, name } = req.body;
  if (!pdf || !name) {
    return res.status(400).json({ error: "Missing pdf or name" });
  }
  writeResume({ pdf, name });
  res.json({ success: true });
});

router.delete("/", (req, res) => {
  deleteResume();
  res.json({ success: true });
});

export default router;

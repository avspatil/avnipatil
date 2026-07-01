import { Router } from "express";
import { readTable, writeTable } from "../utils/fileStorage";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", (req, res) => {
  res.json(readTable());
});

router.post("/", requireAuth, (req, res) => {
  const table = readTable();

  const newRow = {
    id: Date.now(),
    ...req.body
  };

  table.push(newRow);
  writeTable(table);

  res.json(newRow);
});

router.put("/:id", requireAuth, (req, res) => {
  let table = readTable();

  table = table.map((row: any) =>
    row.id == req.params.id ? { ...row, ...req.body } : row
  );

  writeTable(table);
  res.json({ success: true });
});

router.delete("/:id", requireAuth, (req, res) => {
  let table = readTable();

  table = table.filter((r: any) => r.id != req.params.id);

  writeTable(table);
  res.json({ success: true });
});

export default router;
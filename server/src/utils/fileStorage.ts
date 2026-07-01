import fs from "fs";
import path from "path";

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const filePath = path.join(PROJECT_ROOT, "src", "data", "table.json");

export function readTable() {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function writeTable(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
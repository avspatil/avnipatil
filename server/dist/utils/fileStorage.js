"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTable = readTable;
exports.writeTable = writeTable;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const PROJECT_ROOT = path_1.default.resolve(__dirname, "..", "..");
const filePath = path_1.default.join(PROJECT_ROOT, "src", "data", "table.json");
function readTable() {
    return JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
}
function writeTable(data) {
    fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

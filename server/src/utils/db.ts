import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.resolve(__dirname, "..", "..", "data.db");

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL DEFAULT '',
    links TEXT NOT NULL DEFAULT '[]',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL,
    tag TEXT NOT NULL DEFAULT '',
    tag_color TEXT NOT NULL DEFAULT '#000000',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS resume (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    pdf TEXT NOT NULL,
    name TEXT NOT NULL
  );
`);

export default db;

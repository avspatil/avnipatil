import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let _neon: NeonQueryFunction<false, false>;

function getNeon(): NeonQueryFunction<false, false> {
  if (!_neon) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _neon = neon(url);
  }
  return _neon;
}

type SqlTag = (strings: TemplateStringsArray, ...values: any[]) => Promise<Record<string, any>[]>;

function sql(strings: TemplateStringsArray, ...values: any[]): Promise<Record<string, any>[]> {
  return getNeon()(strings, ...values) as Promise<Record<string, any>[]>;
}

export { sql as getSql };

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT '',
      links TEXT NOT NULL DEFAULT '[]',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL,
      tag TEXT NOT NULL DEFAULT '',
      tag_color TEXT NOT NULL DEFAULT '#000000',
      created_at TEXT NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS resume (
      id INTEGER PRIMARY KEY,
      url TEXT NOT NULL DEFAULT '',
      pdf_data BYTEA,
      pdf_filename TEXT
    )
  `;

  try {
    await sql`ALTER TABLE resume ADD COLUMN IF NOT EXISTS pdf_data BYTEA`;
  } catch { /* column already exists */ }
  try {
    await sql`ALTER TABLE resume ADD COLUMN IF NOT EXISTS pdf_filename TEXT`;
  } catch { /* column already exists */ }

  await sql`
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS auth_tokens (
      token TEXT PRIMARY KEY,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
}

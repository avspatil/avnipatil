import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let _neon: NeonQueryFunction<false, false>;

function getNeon(): NeonQueryFunction<false, false> {
  if (!_neon) {
    _neon = neon(process.env.DATABASE_URL!);
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
      url TEXT NOT NULL DEFAULT ''
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMP NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions (expire)`;
}

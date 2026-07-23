import { Store } from "express-session";
import { getSql } from "./db";

const TIMEOUT_MS = 5000;

let sessionsReady: Promise<boolean> | null = null;

function ensureSessionsTable(): Promise<boolean> {
  if (!sessionsReady) {
    sessionsReady = getSql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `.then(() => {
      return getSql`CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions (expire)`.then(() => true);
    }).catch(() => false);
  }
  return sessionsReady;
}

function withTimeout<T>(promise: Promise<T>, callback: (err: any, result?: any) => void): void {
  let settled = false;
  const timer = setTimeout(() => {
    if (!settled) {
      settled = true;
      callback(new Error("Database timeout"));
    }
  }, TIMEOUT_MS);
  promise
    .then((result) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        callback(null, result);
      }
    })
    .catch((err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        callback(err);
      }
    });
}

export class NeonSessionStore extends Store {
  get(sid: string, callback: (err: any, session?: any) => void): void {
    withTimeout(
      ensureSessionsTable().then(() =>
        getSql`SELECT sess FROM sessions WHERE sid = ${sid} AND expire > NOW()`
      ).then((rows) => {
        if (rows.length === 0) return null;
        return rows[0].sess;
      }),
      callback
    );
  }

  set(sid: string, session: any, callback?: (err?: any) => void): void {
    const expire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    withTimeout(
      ensureSessionsTable().then(() =>
        getSql`INSERT INTO sessions (sid, sess, expire) VALUES (${sid}, ${JSON.stringify(session)}, ${expire.toISOString()}) ON CONFLICT (sid) DO UPDATE SET sess = EXCLUDED.sess, expire = EXCLUDED.expire`
      ),
      callback || (() => {})
    );
  }

  destroy(sid: string, callback?: (err?: any) => void): void {
    withTimeout(
      ensureSessionsTable().then(() =>
        getSql`DELETE FROM sessions WHERE sid = ${sid}`
      ),
      callback || (() => {})
    );
  }

  touch(sid: string, session: any, callback?: (err?: any) => void): void {
    const expire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    withTimeout(
      ensureSessionsTable().then(() =>
        getSql`UPDATE sessions SET expire = ${expire.toISOString()} WHERE sid = ${sid}`
      ),
      callback || (() => {})
    );
  }
}

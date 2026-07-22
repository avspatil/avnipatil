import { Store } from "express-session";
import { getSql } from "./db";

export class NeonSessionStore extends Store {
  constructor() {
    super();
    this.init();
  }

  private async init() {
    await getSql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `;
    await getSql`CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions (expire)`;
  }

  get(sid: string, callback: (err: any, session?: any) => void): void {
    getSql`SELECT sess FROM sessions WHERE sid = ${sid} AND expire > NOW()`
      .then((rows) => {
        if (rows.length === 0) return callback(null, null);
        callback(null, rows[0].sess);
      })
      .catch((err) => callback(err));
  }

  set(sid: string, session: any, callback?: (err?: any) => void): void {
    const expire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    getSql`
      INSERT INTO sessions (sid, sess, expire) VALUES (${sid}, ${JSON.stringify(session)}, ${expire.toISOString()})
      ON CONFLICT (sid) DO UPDATE SET sess = EXCLUDED.sess, expire = EXCLUDED.expire
    `
      .then(() => callback?.())
      .catch((err) => callback?.(err));
  }

  destroy(sid: string, callback?: (err?: any) => void): void {
    getSql`DELETE FROM sessions WHERE sid = ${sid}`
      .then(() => callback?.())
      .catch((err) => callback?.(err));
  }

  touch(sid: string, session: any, callback?: (err?: any) => void): void {
    const expire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    getSql`UPDATE sessions SET expire = ${expire.toISOString()} WHERE sid = ${sid}`
      .then(() => callback?.())
      .catch((err) => callback?.(err));
  }
}

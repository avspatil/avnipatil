const {neon} = require('@neondatabase/serverless');
require('dotenv').config();

async function test() {
  const sql = neon(process.env.DATABASE_URL);
  
  // Check if sessions table exists
  try {
    const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
    console.log('Tables:', tables.map(r => r.tablename));
  } catch(e) {
    console.log('Table check error:', e.message);
  }

  // Try to insert a session
  try {
    const sess = JSON.stringify({user: "admin"});
    const expire = new Date(Date.now() + 86400000).toISOString();
    await sql`INSERT INTO sessions (sid, sess, expire) VALUES ('test-123', ${sess}::jsonb, ${expire}) ON CONFLICT (sid) DO UPDATE SET sess = EXCLUDED.sess`;
    console.log('Session INSERT: OK');
  } catch(e) {
    console.log('Session INSERT error:', e.message);
  }

  // Try to read it back
  try {
    const rows = await sql`SELECT sess FROM sessions WHERE sid = 'test-123'`;
    console.log('Session SELECT:', rows);
  } catch(e) {
    console.log('Session SELECT error:', e.message);
  }

  // Cleanup
  try {
    await sql`DELETE FROM sessions WHERE sid = 'test-123'`;
    console.log('Session DELETE: OK');
  } catch(e) {
    console.log('Session DELETE error:', e.message);
  }
}

test().catch(console.error);

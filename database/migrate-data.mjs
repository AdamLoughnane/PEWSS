// Run only before cutover, against the new PEWSS database. Never prints applicant data.
// node --env-file=.env.neon-migration.local database/migrate-data.mjs PRIVATE_BACKUP.json
import { Pool } from 'pg';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const snapshot = JSON.parse(await readFile(process.argv[2], 'utf8'));
const url = new URL(process.env.NEON_OWNER_URL);
for (const key of ['sslmode', 'channel_binding']) url.searchParams.delete(key);
const pool = new Pool({ connectionString: url.toString(), ssl: { rejectUnauthorized: true } });
const db = await pool.connect();
try {
  await db.query('begin');
  for (const [table, rows] of [['pewss_applications', snapshot.applications], ['pewss_decisions', snapshot.decisions]]) {
    assert.ok(Array.isArray(rows));
    for (const row of rows) {
      await db.query(`insert into public.${table} select * from jsonb_populate_record(null::public.${table}, $1::jsonb) on conflict(id) do nothing`, [JSON.stringify(row)]);
      const match = await db.query(`select to_jsonb(t)=to_jsonb(jsonb_populate_record(null::public.${table},$1::jsonb)) as identical from public.${table} t where id=$2`, [JSON.stringify(row), row.id]);
      assert.equal(match.rows[0]?.identical, true, `${table}: source and destination differ; transaction cancelled`);
    }
    const count = await db.query(`select count(*)::int as n from public.${table}`);
    assert.equal(count.rows[0].n, rows.length, `${table}: record count differs`);
    console.log(`${table}: ${rows.length} records matched exactly, including timestamps and private attachments`);
  }
  await db.query('commit');
} catch (error) {
  await db.query('rollback');
  console.error(error.message);
  process.exitCode = 1;
} finally { db.release(); await pool.end(); }

import { Pool } from 'pg';

let pool: Pool | null = null;
export function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing');
  if (!pool) pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 5
  });
  return pool;
}

export async function saveAudit(input: {
  clientId: string; url: string; status: string; progress: number;
  result?: unknown; reportPath?: string; error?: string;
}) {
  const p = db();
  const result = input.result ? JSON.stringify(input.result) : null;
  await p.query(
    `INSERT INTO audits (id, client_id, url, status, progress, result, report_path, error, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,NOW())
     ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, progress=EXCLUDED.progress,
       result=COALESCE(EXCLUDED.result,audits.result), report_path=COALESCE(EXCLUDED.report_path,audits.report_path),
       error=EXCLUDED.error, updated_at=NOW()`,
    [input.clientId, input.clientId, input.url, input.status, input.progress, result, input.reportPath ?? null, input.error ?? null]
  );
}

export async function updateAudit(id: string, patch: {
  status?: string; progress?: number; result?: unknown; reportPath?: string; error?: string;
}) {
  const p = db();
  await p.query(
    `UPDATE audits SET status=COALESCE($2,status), progress=COALESCE($3,progress),
     result=COALESCE($4::jsonb,result), report_path=COALESCE($5,report_path),
     error=$6, updated_at=NOW() WHERE id=$1`,
    [id, patch.status ?? null, patch.progress ?? null,
     patch.result ? JSON.stringify(patch.result) : null, patch.reportPath ?? null, patch.error ?? null]
  );
}

export async function getAudit(id: string) {
  const { rows } = await db().query('SELECT * FROM audits WHERE id=$1', [id]);
  return rows[0] ?? null;
}
export async function listAudits() {
  const { rows } = await db().query('SELECT * FROM audits ORDER BY created_at DESC LIMIT 50');
  return rows;
}
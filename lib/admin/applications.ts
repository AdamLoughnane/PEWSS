import "server-only";
import { createHash } from "node:crypto";
import { query } from "./database";
import type { Application, ApplicationStore } from "../applications";
import type { ApplicantSummary, Decision } from "./model";
export const summaryColumns =
  "id,reference,name,email,institution,career_stage,country,created_at,status,notification_sent";
export type Applicant = ApplicantSummary & {
  responses: Omit<Application, "photo">;
  source: string;
};
export function applicationStore(imported?: {
  source: "email_import";
  receivedAt: string;
}): ApplicationStore {
  return {
    async save(application, reference) {
      const hash = createHash("sha256").update(JSON.stringify(application)).digest("hex");
      const { photo, ...responses } = application;
      const id = reference.replace("PEWSS-2027-", "");
      const inserted = await query(`insert into public.pewss_applications
        (id, reference, name, email, institution, career_stage, country, responses, photo, payload_hash, source, created_at)
        values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,$11,coalesce($12::timestamptz,now()))
        on conflict (id) do nothing returning id`,
        [id,reference,application.name,application.email,application.institution,application.careerStage,
          application.country,JSON.stringify(responses),photo ? JSON.stringify(photo) : null,hash,imported?.source ?? "form",imported?.receivedAt ?? null]);
      if (inserted.rowCount) return { notified: false };
      const { rows } = await query("select payload_hash,notification_sent from public.pewss_applications where id=$1", [id]);
      if (!rows[0] || rows[0].payload_hash !== hash) throw new Error("Submission conflict");
      return { notified: rows[0].notification_sent as boolean };
    },
    async markNotified(reference) {
      await query("update public.pewss_applications set notification_sent=true where reference=$1", [reference]);
    },
  };
}
export async function listApplicants(q: string, status: string, page: number) {
  const filter = `where ($1::text='' or name ilike $3 or email ilike $3 or institution ilike $3) and ($2::text='' or status=$2)`;
  const values = [q, status, `%${q.replace(/[\\%_]/g, "\\$&")}%`];
  const [records, count, totals] = await Promise.all([
    query<ApplicantSummary>(`select ${summaryColumns} from public.pewss_applications ${filter} order by created_at desc,id limit 50 offset $4`, [...values,(page-1)*50]),
    query(`select count(*)::int as count from public.pewss_applications ${filter}`,values),
    query(`select count(*)::int as total, count(*) filter(where status='pending')::int as pending,
      count(*) filter(where status='accepted')::int as accepted, count(*) filter(where status='rejected')::int as rejected from public.pewss_applications`),
  ]);
  const t=totals.rows[0];
  return {applicants:records.rows,count:count.rows[0].count as number,counts:[t.total,t.pending,t.accepted,t.rejected] as number[]};
}
export async function getApplicant(id: string) {
  const { rows } = await query<Applicant & {has_photo: boolean}>(`select ${summaryColumns},responses,source,photo is not null as has_photo from public.pewss_applications where id=$1`, [id]);
  if (!rows[0]) return null;
  const { rows: decisions } = await query<Decision>(`select id,application_id,outcome,subject,body,recipient,sender,state,created_at,sent_at,provider_id from public.pewss_decisions where application_id=$1`, [id]);
  const {has_photo,...applicant}=rows[0];
  const decision=decisions[0] ?? null;
  return {applicant, decision, hasPhoto:has_photo, expired:Boolean(decision && Date.now()-new Date(decision.created_at).getTime()>=23*60*60*1000)};
}

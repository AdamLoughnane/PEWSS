import "server-only";
import { createHash } from "node:crypto";
import { database } from "./supabase";
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
      const db = database();
      const hash = createHash("sha256")
        .update(JSON.stringify(application))
        .digest("hex");
      const { photo, ...responses } = application;
      const row = {
        id: reference.replace("PEWSS-2027-", ""),
        reference,
        name: application.name,
        email: application.email,
        institution: application.institution,
        career_stage: application.careerStage,
        country: application.country,
        responses,
        photo,
        payload_hash: hash,
        ...(imported
          ? { source: imported.source, created_at: imported.receivedAt }
          : {}),
      };
      const { error } = await db.from("pewss_applications").insert(row);
      if (error && error.code !== "23505")
        throw new Error("Could not save application");
      if (!error) return { notified: false };
      const { data, error: readError } = await db
        .from("pewss_applications")
        .select("payload_hash,notification_sent")
        .eq("id", row.id)
        .single();
      if (readError || !data || data.payload_hash !== hash)
        throw new Error("Submission conflict");
      return { notified: data.notification_sent as boolean };
    },
    async markNotified(reference) {
      const { error } = await database()
        .from("pewss_applications")
        .update({ notification_sent: true })
        .eq("reference", reference);
      if (error) throw new Error("Could not update notification status");
    },
  };
}
export async function getApplicant(id: string) {
  const db = database();
  const { data, error } = await db
    .from("pewss_applications")
    .select(`${summaryColumns},responses,source`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Could not load application");
  if (!data) return null;
  const { data: decision, error: decisionError } = await db
    .from("pewss_decisions")
    .select(
      "id,application_id,outcome,subject,body,recipient,sender,state,created_at,sent_at,provider_id",
    )
    .eq("application_id", id)
    .maybeSingle();
  if (decisionError) throw new Error("Could not load decision");
  const { count, error: photoError } = await db
    .from("pewss_applications")
    .select("id", { count: "exact", head: true })
    .eq("id", id)
    .not("photo", "is", null);
  if (photoError) throw new Error("Could not load photograph status");
  return {
    applicant: data as Applicant,
    decision: decision as Decision | null,
    hasPhoto: Boolean(count),
    expired: Boolean(
      decision &&
      Date.now() - new Date(decision.created_at).getTime() >=
        23 * 60 * 60 * 1000,
    ),
  };
}

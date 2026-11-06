import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { administrator } from "../../../lib/admin/supabase";
import { getApplicant } from "../../../lib/admin/applications";
import { UUID } from "../../../lib/admin/model";
import { SignOut } from "../login-form";
import { DecisionForm } from "./decision-form";
import styles from "../admin.module.css";
export default async function ApplicantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await administrator())) redirect("/admin");
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const record = await getApplicant(id);
  if (!record) notFound();
  const { applicant: a, decision, hasPhoto, expired } = record;
  const responses = a.responses;
  return (
    <>
      <Link className={styles.back} href="/admin">
        ← All applications
      </Link>
      <div className={styles.top}>
        <div>
          <p className={styles.subtitle}>
            Received{" "}
            {new Date(a.created_at).toLocaleString("en-IE", {
              timeZone: "Europe/Dublin",
            })}
          </p>
          <h1 className={styles.title}>{a.name}</h1>
          <span className={`${styles.badge} ${styles[a.status] ?? ""}`}>
            {a.status === "pending" ? "Awaiting review" : a.status}
          </span>
        </div>
        <SignOut />
      </div>
      {!a.notification_sent && (
        <p className={styles.notice}>
          This application is safely stored here. The organiser’s notification
          email has not been confirmed.
        </p>
      )}
      <div className={styles.details}>
        <div>
          <section className={styles.panel}>
            <h2>Applicant details</h2>
            {hasPhoto && (
              /* Authenticated endpoint; never use a public image optimiser for private photos. */ <a
                href={`/api/admin/applicants/${id}/photo`}
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  unoptimized
                  width={160}
                  height={220}
                  className={styles.photo}
                  src={`/api/admin/applicants/${id}/photo`}
                  alt={`Application photograph of ${a.name}`}
                />
              </a>
            )}
            <dl>
              {[
                ["Email", a.email],
                ["Institution", a.institution || "Not provided"],
                ["Career stage", a.career_stage],
                ["Country", a.country],
                ["ECTS interest", responses.ects],
                ["Website", responses.website || "Not provided"],
                ["ORCID", responses.orcid || "Not provided"],
                ["Reference", a.reference],
                [
                  "Privacy acknowledgement",
                  responses.privacyAcknowledgement ? "Given" : "Not recorded",
                ],
                [
                  "Photograph permission",
                  hasPhoto && responses.photoConsent
                    ? "Application use only"
                    : "No photograph supplied",
                ],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "contents" }}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className={styles.panel}>
            <h2>Application responses</h2>
            <h3>Research interests</h3>
            <p className={styles.response}>{responses.researchInterests}</p>
            <h3>Short biography</h3>
            <p className={styles.response}>{responses.biography}</p>
            <h3>Statement of interest</h3>
            <p className={styles.response}>{responses.statement}</p>
          </section>
        </div>
        <DecisionForm
          id={id}
          name={a.name}
          email={a.email}
          decision={decision}
          expired={expired}
        />
      </div>
    </>
  );
}

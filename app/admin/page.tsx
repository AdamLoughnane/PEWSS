import Link from "next/link";
import {
  adminConfigured,
  administrator,
  database,
} from "../../lib/admin/supabase";
import { summaryColumns } from "../../lib/admin/applications";
import type { ApplicantSummary } from "../../lib/admin/model";
import { AdminLogin, SignOut } from "./login-form";
import styles from "./admin.module.css";
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!adminConfigured()) return <AdminLogin configured={false} />;
  if (!(await administrator())) return <AdminLogin configured />;
  const params = await searchParams;
  const q =
    typeof params.q === "string"
      ? params.q
          .replace(/[^\p{L}\p{N}\s@.\-']/gu, "")
          .slice(0, 80)
          .trim()
      : "";
  const status =
    typeof params.status === "string" &&
    ["pending", "accepted", "rejected"].includes(params.status)
      ? params.status
      : "";
  const page = Math.min(
    10000,
    Math.max(1, Number.parseInt(String(params.page ?? "1")) || 1),
  );
  const db = database();
  let query = db
    .from("pewss_applications")
    .select(summaryColumns, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id")
    .range((page - 1) * 50, page * 50 - 1);
  if (status) query = query.eq("status", status);
  if (q)
    query = query.or(
      `name.ilike.%${q}%,email.ilike.%${q}%,institution.ilike.%${q}%`,
    );
  const [records, ...counts] = await Promise.all([
    query,
    ...["", "pending", "accepted", "rejected"].map((value) => {
      const query = db
        .from("pewss_applications")
        .select("id", { count: "exact", head: true });
      return value ? query.eq("status", value) : query;
    }),
  ]);
  const failed = records.error || counts.some((item) => item.error);
  const applicants = (records.data ?? []) as ApplicantSummary[];
  const pageUrl = (p: number) =>
    `/admin?${new URLSearchParams({ q, status, page: String(p) })}`;
  return (
    <>
      <div className={styles.top}>
        <div>
          <p className={styles.subtitle}>PEWSS 2027 · (non)Self and Space</p>
          <h1 className={styles.title}>Applications</h1>
          <p className={styles.subtitle}>
            Review submissions and send each applicant your decision.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/import" className={styles.button}>
            Import earlier application
          </Link>
          <SignOut />
        </div>
      </div>
      {failed ? (
        <p role="alert" className={styles.notice}>
          Applications could not be loaded. Please refresh the page. No
          decisions have been changed.
        </p>
      ) : (
        <>
          <div className={styles.stats}>
            {["All applicants", "Awaiting review", "Accepted", "Rejected"].map(
              (label, i) => (
                <div className={styles.stat} key={label}>
                  <strong>{counts[i].count ?? 0}</strong>
                  <span>{label}</span>
                </div>
              ),
            )}
          </div>
          <form className={styles.filters}>
            <label>
              Search applicants
              <input
                name="q"
                defaultValue={q}
                placeholder="Name, email or institution"
              />
            </label>
            <label>
              Status
              <select name="status" defaultValue={status}>
                <option value="">All statuses</option>
                <option value="pending">Awaiting review</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <button className={`${styles.button} ${styles.primary}`}>
              Search
            </button>
            <Link className={styles.button} href="/admin">
              Reset
            </Link>
          </form>
          {applicants.length ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Institution / stage</th>
                    <th>Received</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Review</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <Link href={`/admin/${a.id}`}>{a.name}</Link>
                        <small>{a.email}</small>
                      </td>
                      <td>
                        {a.institution || "Not provided"}
                        <small>{a.career_stage}</small>
                      </td>
                      <td>
                        {new Date(a.created_at).toLocaleDateString("en-IE", {
                          timeZone: "Europe/Dublin",
                        })}
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${styles[a.status] ?? ""}`}
                        >
                          {a.status === "pending"
                            ? "Awaiting review"
                            : a.status}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/${a.id}`}>Review →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.empty}>
              <h2>
                {q || status
                  ? "No matching applications"
                  : "No applications yet"}
              </h2>
              <p className={styles.subtitle}>
                {q || status
                  ? "Try another search or status."
                  : "New submissions will appear here. Earlier emailed applications need to be imported."}
              </p>
            </div>
          )}
          <nav aria-label="Application pages" className={styles.pager}>
            {page > 1 ? (
              <Link href={pageUrl(page - 1)}>← Previous</Link>
            ) : (
              <span />
            )}
            <span>
              {records.count ?? 0} applications · Page {page}
            </span>
            {page * 50 < (records.count ?? 0) ? (
              <Link href={pageUrl(page + 1)}>Next →</Link>
            ) : (
              <span />
            )}
          </nav>
        </>
      )}
    </>
  );
}

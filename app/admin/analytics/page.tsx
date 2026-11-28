import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { websiteAnalytics } from "../../../lib/admin/analytics";
import { AdminNavigation } from "../admin-navigation";
import { SignOut } from "../login-form";
import { AnalyticsView, DateFilters } from "./report";
import styles from "../admin.module.css";

export const metadata: Metadata = { title: "Website analytics — PEWSS administration" };
export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const result = await websiteAnalytics(await searchParams);
  if (result.status === "unauthorised") redirect("/admin");
  return <>
    <AdminNavigation current="analytics" />
    <div className={styles.top}>
      <div><p className={styles.subtitle}>PEWSS 2027 · Private dashboard</p><h1 className={styles.title}>Website analytics</h1><p className={styles.subtitle}>Who is finding the Summer School, and how they explore it.</p></div>
      <div className={styles.actions}><a className={styles.button} href="https://vercel.com/samedifs-projects/pewss/analytics?environment=production" target="_blank" rel="noreferrer">Open in Vercel ↗</a><SignOut /></div>
    </div>
    {result.status === "ready" ? <AnalyticsView report={result.report} /> : <>
      <DateFilters range={result.status === "not_connected" ? result.range : undefined} />
      <div className={styles.notice} role="status">
        {result.status === "invalid" ? result.message : <><strong>Connect Vercel to display live figures here.</strong><p>Visitor tracking is already running. This private dashboard is waiting for its secure connection to Vercel. Until then, use “Open in Vercel” to see the reports.</p></>}
      </div>
    </>}
  </>;
}

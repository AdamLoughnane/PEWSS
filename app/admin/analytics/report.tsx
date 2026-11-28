import Link from "next/link";
import type { AnalyticsRange, AnalyticsReport, Breakdown, ReportSection } from "../../../lib/admin/analytics-report";
import shared from "../admin.module.css";
import styles from "./analytics.module.css";

const number = (n: number) => n.toLocaleString("en-IE");
const regions = new Intl.DisplayNames(["en-IE"], { type: "region" });
function country(label: string) {
  try { return /^[A-Z]{2}$/.test(label) ? regions.of(label) ?? label : label; } catch { return label; }
}
const sourceNames: Record<string, string> = { instagram: "Instagram", bluesky: "Bluesky", facebook: "Facebook", poster_qr: "Poster QR code", other: "Other referrals", direct_or_unknown: "Direct or unknown" };

export function DateFilters({ range }: { range?: AnalyticsRange }) {
  const today = new Date().toISOString().slice(0, 10);
  return <div className={styles.controls}>
    <nav aria-label="Analytics date presets" className={styles.presets}>
      {[7, 30, 90].map((days) => <Link key={days} prefetch={false} href={`/admin/analytics?days=${days}`}>Last {days} days</Link>)}
    </nav>
    <form action="/admin/analytics" className={shared.filters}>
      <label>From<input type="date" name="from" required defaultValue={range?.from} max={today} /></label>
      <label>To<input type="date" name="to" required defaultValue={range?.to} max={today} /></label>
      <button className={`${shared.button} ${shared.primary}`}>Update report</button>
    </form>
    <p className={shared.subtitle}>Production website · Dates use UTC · Up to 90 days per report</p>
  </div>;
}

function BreakdownPanel({ title, description, section, metric = "Page views", label = (s) => s }: {
  title: string; description?: string; section: ReportSection<Breakdown[]>; metric?: string; label?: (s: string) => string;
}) {
  const max = Math.max(1, ...(section.data ?? []).map((r) => r.visitors));
  return <section className={`${shared.panel} ${styles.panel}`}>
    <h2>{title}</h2>
    {description && <p className={styles.explanation}>{description}</p>}
    {section.error ? <p role="status" className={styles.unavailable}>{section.error}</p> : !section.data?.length ? <p className={styles.empty}>No data recorded for these dates.</p> : <div className={styles.scroll}>
      <table className={styles.breakdown}>
        <caption className="sr-only">{title}</caption>
        <thead><tr><th scope="col">{title === "Countries" ? "Country" : "Name"}</th><th scope="col">Visitors</th><th scope="col">{metric}</th></tr></thead>
        <tbody>{section.data.map((row, i) => <tr key={`${row.label}-${i}`}>
          <th scope="row"><span className={styles.bar} style={{ width: `${row.visitors / max * 100}%` }} aria-hidden="true" /><span className={styles.label}>{label(row.label)}</span></th>
          <td>{number(row.visitors)}</td><td>{number(row.total)}</td>
        </tr>)}</tbody>
      </table>
    </div>}
  </section>;
}

function TrafficTrend({ report }: { report: AnalyticsReport }) {
  const data = report.daily.data;
  const max = Math.max(1, ...(data ?? []).map((r) => Math.max(r.pageviews, r.visitors)));
  const days = Math.round((Date.parse(report.range.to) - Date.parse(report.range.from)) / 86_400_000) + 1;
  const points = Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.parse(report.range.from) + i * 86_400_000).toISOString().slice(0, 10);
    return data?.find((row) => row.date === date) ?? { date, visitors: 0, pageviews: 0 };
  });
  const x = (i: number) => 35 + i * 930 / Math.max(1, days - 1);
  const y = (n: number) => 155 - n / max * 130;
  return <section className={`${shared.panel} ${styles.trend}`}>
    <div className={styles.trendHeading}><h2>Visits over time</h2><p><span className={styles.viewsDot} /> Page views <span className={styles.visitorsDot} /> Visitors</p></div>
    {report.daily.error ? <p role="status" className={styles.unavailable}>{report.daily.error}</p> : <>
      <svg viewBox="0 0 1000 190" className={styles.chart} role="img" aria-label={`Daily page views and visitors from ${report.range.from} to ${report.range.to}. Exact figures are in the table below.`}>
        {[0, 0.5, 1].map((fraction) => <g key={fraction}><line x1="35" x2="965" y1={y(fraction * max)} y2={y(fraction * max)} stroke="#dedbd1" /><text x="27" y={y(fraction * max) + 4} textAnchor="end" fontSize="11" fill="#666b61">{number(Math.round(fraction * max))}</text></g>)}
        <polyline fill="none" stroke="#927851" strokeWidth="2.5" points={points.map((r, i) => `${x(i)},${y(r.pageviews)}`).join(" ")} />
        <polyline fill="none" stroke="#2e4b40" strokeWidth="2.5" points={points.map((r, i) => `${x(i)},${y(r.visitors)}`).join(" ")} />
        {points.map((r, i) => <g key={r.date}><circle cx={x(i)} cy={y(r.pageviews)} r="2.5" fill="#927851"><title>{`${r.date}: ${r.pageviews} page views`}</title></circle><circle cx={x(i)} cy={y(r.visitors)} r="2.5" fill="#2e4b40"><title>{`${r.date}: ${r.visitors} visitors`}</title></circle></g>)}
        <text x="35" y="180" fontSize="12" fill="#666b61">{report.range.from}</text><text x="965" y="180" textAnchor="end" fontSize="12" fill="#666b61">{report.range.to}</text>
      </svg>
      <details className={styles.dailyDetails}><summary>View daily figures</summary><div className={styles.scroll}><table className={styles.breakdown}><caption className="sr-only">Daily traffic in UTC</caption><thead><tr><th scope="col">Date (UTC)</th><th scope="col">Visitors</th><th scope="col">Page views</th></tr></thead><tbody>{points.map((r) => <tr key={r.date}><th scope="row">{r.date}</th><td>{number(r.visitors)}</td><td>{number(r.pageviews)}</td></tr>)}</tbody></table></div></details>
    </>}
  </section>;
}

export function AnalyticsView({ report }: { report: AnalyticsReport }) {
  const eventTotal = (name: string) => report.events.data ? report.events.data.find((row) => row.label === name)?.total ?? 0 : undefined;
  const poster = report.sources.data?.find((row) => row.label === "poster_qr");
  const cards = [
    { label: "Visitors", value: report.totals.data?.visitors, note: "Vercel’s estimated visitor count" },
    { label: "Page views", value: report.totals.data?.pageviews, note: "Public pages viewed" },
    { label: "Poster QR visitors", value: report.sources.data ? poster?.visitors ?? 0 : undefined, note: "Estimated visitors using the tagged poster link" },
    { label: "Poster QR arrivals", value: report.sources.data ? poster?.total ?? 0 : undefined, note: "Recorded arrivals, including repeat visits" },
    { label: "Applications started", value: eventTotal("Application started"), note: "First interaction with the form" },
    { label: "Applications submitted", value: eventTotal("Application submitted"), note: "Successful form confirmations" },
  ];
  return <>
    <DateFilters range={report.range} />
    <p className={styles.timestamp}>Fetched from Vercel: {new Date(report.fetchedAt).toLocaleString("en-IE", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" })} UTC. Use “Update report” to refresh.</p>
    <div className={`${shared.stats} ${styles.stats}`}>{cards.map((card) => <div className={shared.stat} key={card.label}><span>{card.label}</span><strong>{card.value === undefined ? "—" : number(card.value)}</strong><span>{card.value === undefined ? "Temporarily unavailable" : card.note}</span></div>)}</div>
    {report.totals.error && <p role="status" className={shared.notice}>{report.totals.error}</p>}
    <TrafficTrend report={report} />
    <div className={styles.grid}>
      <BreakdownPanel title="Countries" description="Approximate visitor locations, based on their network connection." section={report.countries} label={country} />
      <BreakdownPanel title="Traffic sources" description="Sources recorded by the Visit source event. Tagged links identify the poster QR code, Instagram, Bluesky and Facebook." section={report.sources} metric="Arrivals" label={(s) => sourceNames[s] ?? s} />
      <BreakdownPanel title="Pages" section={report.pages} />
      <BreakdownPanel title="Referring websites" description="Referrers supplied by browsers. Some apps hide this information." section={report.referrers} label={(s) => s === "Unknown" ? "Direct or unknown" : s} />
      <BreakdownPanel title="Clicks and applications" section={report.events} metric="Events" />
      <BreakdownPanel title="Devices" section={report.devices} label={(s) => s.charAt(0).toUpperCase() + s.slice(1)} />
      <BreakdownPanel title="Browsers" section={report.browsers} />
    </div>
    <aside className={styles.notes}>
      <h2>Reading these figures</h2>
      <p>These are Vercel’s figures for the production website. Match the dates and Production environment in Vercel when comparing; newly received events can take a little time to appear. Visitor totals come directly from Vercel, rather than adding up daily counts.</p>
      <p>Source arrivals and application events are activity counts, not individual people. Repeat visits and verification traffic are included. Blocked tracking can reduce the counts. Your <Link href="/admin" prefetch={false}>applications list</Link> remains the definitive record of submitted applications.</p>
      <p>Poster figures require the tagged QR link. The original poster links directly to /apply, so its scans cannot be distinguished from other direct visits or recovered retrospectively. These figures count visits after opening the tagged link, not scans that never open the website. Sharing the tagged link also counts towards the poster source.</p>
      <p>Reports show up to 100 entries per category, with any remaining entries grouped by Vercel as “Others”. Private admin pages, application answers and photographs are excluded from tracking.</p>
    </aside>
  </>;
}

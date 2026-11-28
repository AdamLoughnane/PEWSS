export type AnalyticsRange = { from: string; to: string; since: string; until: string };
export type VisitTotals = { visitors: number; pageviews: number };
export type Breakdown = { label: string; visitors: number; total: number };
export type DailyTraffic = VisitTotals & { date: string };
export type ReportSection<T> = { data: T; error?: never } | { data?: never; error: string };
export type AnalyticsReport = {
  range: AnalyticsRange;
  fetchedAt: string;
  totals: ReportSection<VisitTotals>;
  daily: ReportSection<DailyTraffic[]>;
  countries: ReportSection<Breakdown[]>;
  pages: ReportSection<Breakdown[]>;
  referrers: ReportSection<Breakdown[]>;
  devices: ReportSection<Breakdown[]>;
  browsers: ReportSection<Breakdown[]>;
  events: ReportSection<Breakdown[]>;
  sources: ReportSection<Breakdown[]>;
};

const DAY = 86_400_000;
type Params = Record<string, string | string[] | undefined>;
export function analyticsRange(params: Params, now = new Date()): AnalyticsRange {
  const today = now.toISOString().slice(0, 10);
  const days = params.days === "30" ? 30 : params.days === "90" ? 90 : 7;
  const defaultFrom = new Date(Date.parse(today) - (days - 1) * DAY).toISOString().slice(0, 10);
  const from = params.from ?? defaultFrom;
  const to = params.to ?? today;
  const valid = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!valid(from) || !valid(to) || from > to || to > today || Date.parse(to) - Date.parse(from) >= 90 * DAY) {
    throw new Error("Choose a valid date range of up to 90 days, ending today or earlier.");
  }
  return { from, to, since: `${from}T00:00:00.000Z`, until: new Date(Math.min(Date.parse(to) + DAY - 1, now.getTime())).toISOString() };
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid analytics response");
  return value as Record<string, unknown>;
}
function count(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new Error("Invalid analytics count");
  return value;
}
function rows(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error("Invalid analytics rows");
  return value;
}
function totals(value: unknown): VisitTotals {
  const data = object(value);
  return { visitors: count(data.visitors), pageviews: count(data.pageviews) };
}
function breakdown(value: unknown, dimension: string, metric: "pageviews" | "count"): Breakdown[] {
  return rows(value).map((value) => {
    const row = object(value);
    const label = row[dimension];
    if (label != null && typeof label !== "string") throw new Error("Invalid analytics label");
    return { label: typeof label === "string" && label ? label : "Unknown", visitors: count(row.visitors), total: count(row[metric]) };
  }).sort((a, b) => b.visitors - a.visitors || b.total - a.total);
}
function dailyTraffic(value: unknown): DailyTraffic[] {
  return rows(value).map((value) => {
    const row = object(value);
    if (typeof row.timestamp !== "string" || !Number.isFinite(Date.parse(row.timestamp))) throw new Error("Invalid analytics date");
    return { date: new Date(row.timestamp).toISOString().slice(0, 10), ...totals(row) };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchAnalyticsReport(token: string, range: AnalyticsRange, fetcher: typeof fetch = fetch): Promise<AnalyticsReport> {
  async function query(dataset: "visits" | "events", by?: string) {
    // Fixed upstream and project: neither URLs nor project scope come from a browser request.
    const url = new URL(`https://api.vercel.com/v1/query/web-analytics/${dataset}/${by ? "aggregate" : "count"}`);
    url.search = new URLSearchParams({
      projectId: "pewss", slug: "samedifs-projects", since: range.since, until: range.until,
      filter: by === "eventData/source" ? "environment eq 'production' and eventName eq 'Visit source'" : "environment eq 'production'",
      ...(by ? { by, limit: "100" } : {}),
    }).toString();
    const response = await fetcher(url, {
      method: "GET", headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
      redirect: "error", signal: AbortSignal.timeout(12_000),
    });
    // Provider bodies may contain sensitive diagnostics; never return or log them.
    if (!response.ok) throw new Error(response.status === 401 || response.status === 403
      ? "Vercel access needs reconnecting."
      : response.status === 429 ? "Vercel is busy. Please try again shortly."
      : "Vercel could not return this report. Please try again.");
    return object(await response.json()).data;
  }
  const jobs = [
    query("visits").then(totals),
    query("visits", "day").then(dailyTraffic),
    ...["country", "requestPath", "referrerHostname", "deviceType", "browserName"].map((dimension) =>
      query("visits", dimension).then((value) => breakdown(value, dimension, "pageviews"))),
    query("events", "eventName").then((value) => breakdown(value, "eventName", "count")),
    query("events", "eventData/source").then((value) => breakdown(value, "eventData", "count")),
  ] as const;
  const results = await Promise.allSettled(jobs);
  function section<T>(result: PromiseSettledResult<T>): ReportSection<T> {
    if (result.status === "fulfilled") return { data: result.value };
    const allowed = ["Vercel access needs reconnecting.", "Vercel is busy. Please try again shortly.", "Vercel could not return this report. Please try again."];
    return { error: allowed.includes(result.reason?.message) ? result.reason.message : "This report is temporarily unavailable. Please refresh to try again." };
  }
  return {
    range, fetchedAt: new Date().toISOString(),
    totals: section(results[0]) as ReportSection<VisitTotals>,
    daily: section(results[1]) as ReportSection<DailyTraffic[]>,
    countries: section(results[2]) as ReportSection<Breakdown[]>,
    pages: section(results[3]) as ReportSection<Breakdown[]>,
    referrers: section(results[4]) as ReportSection<Breakdown[]>,
    devices: section(results[5]) as ReportSection<Breakdown[]>,
    browsers: section(results[6]) as ReportSection<Breakdown[]>,
    events: section(results[7]) as ReportSection<Breakdown[]>,
    sources: section(results[8]) as ReportSection<Breakdown[]>,
  };
}

import "server-only";
import { administrator } from "./auth";
import { analyticsRange, fetchAnalyticsReport } from "./analytics-report";

export async function websiteAnalytics(params: Record<string, string | string[] | undefined>) {
  if (!(await administrator())) return { status: "unauthorised" } as const;
  let range;
  try { range = analyticsRange(params); }
  catch { return { status: "invalid", message: "Choose a valid date range of up to 90 days, ending today or earlier." } as const; }
  const token = process.env.VERCEL_ANALYTICS_TOKEN?.trim();
  if (!token) return { status: "not_connected", range } as const;
  return { status: "ready", report: await fetchAnalyticsReport(token, range) } as const;
}

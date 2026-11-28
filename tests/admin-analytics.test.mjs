import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

async function moduleUrl(path, replacements = {}) {
  let source = await readFile(new URL(path, import.meta.url), "utf8");
  for (const [before, after] of Object.entries(replacements)) source = source.replaceAll(before, after);
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}
const reportUrl = await moduleUrl("../lib/admin/analytics-report.ts");
const { analyticsRange, fetchAnalyticsReport } = await import(reportUrl);
const now = new Date("2026-11-28T09:15:00Z");
const range = analyticsRange({}, now);

test("analytics dates use explicit UTC boundaries and reject invalid, future or excessive ranges", () => {
  assert.deepEqual(range, { from: "2026-11-22", to: "2026-11-28", since: "2026-11-22T00:00:00.000Z", until: now.toISOString() });
  assert.equal(analyticsRange({ from: "2026-11-01", to: "2026-11-02" }, now).until, "2026-11-02T23:59:59.999Z");
  for (const params of [{ from: "2026-02-30" }, { to: "2027-01-01" }, { from: "2026-01-01" }, { from: ["2026-11-01"] }, { from: "2026-11-28", to: "2026-11-27" }, { from: "2026-11-01' or true" }]) {
    assert.throws(() => analyticsRange(params, now));
  }
});

function fixture(url) {
  const by = url.searchParams.get("by");
  if (!by) return { visitors: 8, pageviews: 20 };
  if (by === "day") return [{ timestamp: "2026-11-22T00:00:00Z", visitors: 5, pageviews: 10 }, { timestamp: "2026-11-23T00:00:00Z", visitors: 5, pageviews: 10 }];
  if (by === "eventData/source") return [{ eventData: "instagram", visitors: 3, count: 4 }];
  if (by === "eventName") return [{ eventName: "Application submitted", visitors: 2, count: 2 }];
  return [{ [by]: by === "country" ? "IE" : "Example", visitors: 8, pageviews: 20 }];
}
test("reports preserve Vercel totals, query only PEWSS production, and keep credentials server-side", async () => {
  const requests = [];
  const report = await fetchAnalyticsReport("private-test-token", range, async (url, options) => {
    requests.push(url);
    assert.equal(url.origin, "https://api.vercel.com");
    assert.equal(url.searchParams.get("projectId"), "pewss");
    assert.equal(url.searchParams.get("slug"), "samedifs-projects");
    assert.equal(url.searchParams.get("since"), range.since);
    assert.equal(url.searchParams.get("until"), range.until);
    assert.match(url.searchParams.get("filter"), /^environment eq 'production'/);
    assert.equal(options.headers.Authorization, "Bearer private-test-token");
    assert.equal(options.cache, "no-store");
    assert.equal(options.redirect, "error");
    assert.equal(options.method, "GET");
    return Response.json({ data: fixture(url) });
  });
  assert.equal(requests.length, 9);
  assert.deepEqual(report.totals.data, { visitors: 8, pageviews: 20 }); // Not 10 from adding daily visitors.
  assert.equal(report.sources.data[0].label, "instagram");
  assert.equal(report.sources.data[0].total, 4);
  assert.match(requests.find((url) => url.searchParams.get("by") === "eventData/source").searchParams.get("filter"), /eventName eq 'Visit source'/);
  assert.ok(!JSON.stringify(report).includes("private-test-token"));
});

test("partial outages, expired access and malformed counts never appear as zero or expose provider errors", async () => {
  const report = await fetchAnalyticsReport("private-test-token", range, async (url) => {
    const by = url.searchParams.get("by");
    if (!by) return new Response("private upstream diagnostics", { status: 403 });
    if (by === "country") throw new Error("private upstream network address");
    if (by === "eventName") return Response.json({ data: [{ eventName: "Apply clicked", count: null, visitors: 1 }] });
    return Response.json({ data: fixture(url) });
  });
  assert.match(report.totals.error, /reconnecting/);
  assert.equal(report.totals.data, undefined);
  assert.equal(report.events.data, undefined);
  assert.ok(report.countries.error);
  assert.ok(report.pages.data);
  assert.ok(!JSON.stringify(report).includes("private upstream"));
});

test("anonymous users cannot trigger Vercel requests; missing credentials and invalid dates do not fetch", async () => {
  const originals = { fetch: globalThis.fetch, token: process.env.VERCEL_ANALYTICS_TOKEN };
  let calls = 0;
  globalThis.fetch = async (url) => { calls++; return Response.json({ data: fixture(url) }); };
  globalThis.__analyticsAdmin = null;
  const authUrl = `data:text/javascript,${encodeURIComponent("export const administrator = async () => globalThis.__analyticsAdmin;")}`;
  try {
    const { websiteAnalytics } = await import(await moduleUrl("../lib/admin/analytics.ts", {
      'import "server-only";': "", '"./auth"': JSON.stringify(authUrl), '"./analytics-report"': JSON.stringify(reportUrl),
    }));
    process.env.VERCEL_ANALYTICS_TOKEN = "private-test-token";
    assert.equal((await websiteAnalytics({})).status, "unauthorised");
    assert.equal(calls, 0);
    globalThis.__analyticsAdmin = { id: "confirmed-administrator" };
    delete process.env.VERCEL_ANALYTICS_TOKEN;
    assert.equal((await websiteAnalytics({})).status, "not_connected");
    process.env.VERCEL_ANALYTICS_TOKEN = "private-test-token";
    assert.equal((await websiteAnalytics({ from: "invalid" })).status, "invalid");
    assert.equal(calls, 0);
    assert.equal((await websiteAnalytics({ projectId: "other-project", slug: "other-team" })).status, "ready");
    assert.equal(calls, 9);
  } finally {
    globalThis.fetch = originals.fetch;
    if (originals.token === undefined) delete process.env.VERCEL_ANALYTICS_TOKEN; else process.env.VERCEL_ANALYTICS_TOKEN = originals.token;
    delete globalThis.__analyticsAdmin;
  }
});

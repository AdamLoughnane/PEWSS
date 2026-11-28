import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function loadModule(path, replacements = {}) {
  let source = await readFile(new URL(path, import.meta.url), "utf8");
  for (const [from, to] of Object.entries(replacements)) source = source.replaceAll(from, to);
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, jsx: ts.JsxEmit.ReactJSX } });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}
const policyUrl = await loadModule("../lib/analytics-policy.ts");
const { sanitiseAnalyticsUrl, trafficAttribution, linkAction } = await import(policyUrl);

test("analytics permits only public routes and removes all URL payloads", () => {
  assert.equal(sanitiseAnalyticsUrl("https://pewss.org/apply?email=private@example.com&utm_source=instagram#secret"), "https://pewss.org/apply");
  for (const path of ["/admin", "/admin/private-id", "/api/applications", "/login", "/unknown/private-id", "/%61dmin"]) {
    assert.equal(sanitiseAnalyticsUrl(`https://pewss.org${path}`), null);
  }
  assert.equal(sanitiseAnalyticsUrl("not a url"), null);
});

test("form tracking counts first input once and only reports a confirmed submission", async () => {
  const dataModule = (source) => `data:text/javascript,${encodeURIComponent(source)}`;
  const jsx = dataModule("export const jsx = (type, props) => ({type, props}); export const jsxs = jsx; export const Fragment = 'fragment';");
  const hooks = dataModule("export const useRef = current => ({current}); export const useState = value => [value, () => {}]; export const useEffect = () => {};");
  const empty = dataModule("export default {};");
  const events = [];
  const originals = { fetch: globalThis.fetch, FormData: globalThis.FormData, HTMLElement: globalThis.HTMLElement };
  globalThis.__formAnalytics = (...args) => events.push(args);
  globalThis.HTMLElement = class {};
  globalThis.FormData = class extends originals.FormData { constructor() { super(); this.set("email", "private@example.com"); } };
  try {
    let moduleUrl = await loadModule("../app/apply/application-form.tsx", {
      '"next/link"': JSON.stringify(empty),
      '"react"': JSON.stringify(hooks),
      '"../../lib/applications"': JSON.stringify(await loadModule("../lib/applications.ts")),
      '"./application-form.module.css"': JSON.stringify(empty),
      '"../home.module.css"': JSON.stringify(empty),
      '"../../lib/analytics-client"': JSON.stringify(dataModule("export const trackPublicAction = (...args) => globalThis.__formAnalytics(...args);")),
    });
    // The JSX runtime import is generated during transpilation.
    const compiled = Buffer.from(moduleUrl.split(",")[1], "base64").toString().replaceAll('"react/jsx-runtime"', JSON.stringify(jsx));
    moduleUrl = dataModule(compiled);
    const { ApplicationForm } = await import(moduleUrl);
    const target = Object.assign(new HTMLElement(), { id: "email", value: "private@example.com" });
    const event = { preventDefault() {}, currentTarget: {} };
    const disabled = ApplicationForm({ enabled: false });
    disabled.props.onChange({ target });
    await disabled.props.onSubmit(event);
    assert.deepEqual(events, []);

    const form = ApplicationForm({ enabled: true });
    form.props.onChange({ target: Object.assign(new HTMLElement(), { id: "companyWebsite" }) });
    assert.deepEqual(events, []);
    form.props.onChange({ target });
    form.props.onChange({ target });
    assert.deepEqual(events, [["Application started", "form"]]);

    globalThis.fetch = async () => new Response(JSON.stringify({ ok: false, message: "Try again" }), { status: 503 });
    await form.props.onSubmit(event);
    assert.equal(events.length, 1);
    globalThis.fetch = async () => { throw new Error("offline"); };
    await form.props.onSubmit(event);
    assert.equal(events.length, 1);
    globalThis.fetch = async () => new Response(JSON.stringify({ ok: true, reference: "TEST-PRIVATE" }));
    await form.props.onSubmit(event);
    assert.deepEqual(events, [["Application started", "form"], ["Application submitted", "form"]]);
  } finally {
    Object.assign(globalThis, originals);
    delete globalThis.__formAnalytics;
  }
});

test("social tags work without a referrer and override misleading app referrers", () => {
  for (const source of ["instagram", "bluesky", "facebook"]) {
    assert.deepEqual(trafficAttribution(`https://pewss.org/?utm_source=${source}`, ""), { source, method: "tagged_link" });
  }
  assert.equal(trafficAttribution("https://pewss.org/?utm_source=bluesky", "https://facebook.com/").source, "bluesky");
  assert.equal(trafficAttribution("https://pewss.org/?utm_source=private@example.com", "").source, "direct_or_unknown");
});

test("social host matching does not mistake unrelated hosts or private internal paths for social referrals", () => {
  for (const [host, source] of [["l.instagram.com", "instagram"], ["l.facebook.com", "facebook"], ["m.facebook.com", "facebook"], ["bsky.app", "bluesky"], ["instagram.com.attacker.example", "other"]]) {
    assert.deepEqual(trafficAttribution("https://pewss.org/", `https://${host}/secret?email=private`), { source, method: "referrer" });
  }
  assert.deepEqual(trafficAttribution("https://pewss.org/apply", "https://pewss.org/admin/private-id"), { source: "direct_or_unknown", method: "unavailable" });
});

test("only recognised public navigation and the public contact address produce click events", () => {
  assert.equal(linkAction("/apply", "https://pewss.org"), "Apply clicked");
  assert.equal(linkAction("mailto:info@pewss.org?body=private", "https://pewss.org"), "Contact clicked");
  for (const link of ["/admin", "/login", "/api/applications", "https://other.example/apply", "mailto:applicant@example.com", "#name"]) {
    assert.equal(linkAction(link, "https://pewss.org"), null);
  }
});

test("events retain social source through navigation, never send form data, and failures are harmless", async () => {
  const captured = [];
  globalThis.window = { location: new URL("https://pewss.org/?utm_source=instagram&email=private@example.com") };
  globalThis.document = { referrer: "" };
  globalThis.__analyticsTrack = (...args) => captured.push(args);
  const stub = `data:text/javascript,${encodeURIComponent("export const track = (...args) => globalThis.__analyticsTrack(...args);")}`;
  try {
    const client = await import(await loadModule("../lib/analytics-client.ts", { '"@vercel/analytics"': JSON.stringify(stub), '"./analytics-policy"': JSON.stringify(policyUrl) }));
    client.trackArrival(); client.trackArrival();
    window.location = new URL("https://pewss.org/apply");
    client.trackPublicAction("Application started", "form");
    assert.deepEqual(captured, [
      ["Visit source", { source: "instagram", method: "tagged_link" }],
      ["Application started", { source: "instagram", location: "form" }],
    ]);
    window.location = new URL("https://pewss.org/admin/private-id");
    client.trackPublicAction("Application submitted", "form");
    assert.equal(captured.length, 2);
    window.location = new URL("https://pewss.org/apply");
    globalThis.__analyticsTrack = () => { throw new Error("blocked analytics"); };
    assert.doesNotThrow(() => client.trackPublicAction("Application submitted", "form"));
  } finally {
    delete globalThis.window; delete globalThis.document; delete globalThis.__analyticsTrack;
  }
});

// Only these public routes may be sent to the analytics service.
const publicPaths = new Set(["/", "/apply", "/faculty", "/practical-information", "/privacy"]);

export function isPublicAnalyticsPath(path: string) {
  return publicPaths.has(path);
}

export function sanitiseAnalyticsUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!isPublicAnalyticsPath(url.pathname)) return null;
    // Never forward query values, fragments, credentials or application references.
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}

export type TrafficSource = "instagram" | "bluesky" | "facebook" | "other" | "direct_or_unknown";
export type Attribution = { source: TrafficSource; method: "tagged_link" | "referrer" | "unavailable" };

function socialSource(host: string): TrafficSource | null {
  const matches = (domain: string) => host === domain || host.endsWith(`.${domain}`);
  if (matches("instagram.com")) return "instagram";
  if (matches("bsky.app")) return "bluesky";
  if (matches("facebook.com") || matches("fb.com")) return "facebook";
  return null;
}

export function trafficAttribution(href: string, referrer: string): Attribution {
  try {
    const url = new URL(href);
    const tag = url.searchParams.get("utm_source")?.toLowerCase();
    // Accept known campaign labels only; arbitrary URL text could contain personal data.
    const tagged = tag === "instagram" || tag === "facebook" ? tag
      : tag === "bluesky" || tag === "bsky" ? "bluesky" : null;
    if (tagged) return { source: tagged, method: "tagged_link" };
    if (referrer) {
      const from = new URL(referrer);
      const internal = from.origin === url.origin || ["pewss.org", "www.pewss.org"].includes(from.hostname);
      if (!internal) return { source: socialSource(from.hostname) ?? "other", method: "referrer" };
    }
  } catch {
    // Invalid or unavailable referrers do not affect navigation or applications.
  }
  return { source: "direct_or_unknown", method: "unavailable" };
}

export type PublicAction = "Apply clicked" | "Faculty clicked" | "Practical information clicked" | "Contact clicked" | "Application started" | "Application submitted";

export function linkAction(href: string, origin: string): PublicAction | null {
  try {
    const target = new URL(href, origin);
    if (target.protocol === "mailto:" && target.pathname.toLowerCase() === "info@pewss.org") return "Contact clicked";
    if (target.origin !== origin) return null;
    switch (target.pathname) {
      case "/apply": return "Apply clicked";
      case "/faculty": return "Faculty clicked";
      case "/practical-information": return "Practical information clicked";
      default: return null;
    }
  } catch {
    return null;
  }
}

"use client";

import { track } from "@vercel/analytics";
import { isPublicAnalyticsPath, trafficAttribution, type Attribution, type PublicAction } from "./analytics-policy";

// In-memory attribution survives Next.js navigation, without cookies or browser storage.
let entry: Attribution | undefined;
let arrivalTracked = false;

function attribution() {
  return entry ??= trafficAttribution(window.location.href, document.referrer);
}

export function trackArrival() {
  if (typeof window === "undefined" || !isPublicAnalyticsPath(window.location.pathname) || arrivalTracked) return;
  arrivalTracked = true;
  try { track("Visit source", attribution()); } catch { /* Analytics must never interrupt the site. */ }
}

export function trackPublicAction(name: PublicAction, location: "header" | "footer" | "content" | "form" = "content") {
  if (typeof window === "undefined" || !isPublicAnalyticsPath(window.location.pathname)) return;
  try {
    // Pro supports two properties. Never pass field values, email addresses or IDs.
    track(name, { source: attribution().source, location });
  } catch { /* Applications and navigation work even when analytics is unavailable. */ }
}

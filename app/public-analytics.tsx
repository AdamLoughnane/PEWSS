"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackArrival, trackPublicAction } from "../lib/analytics-client";
import { isPublicAnalyticsPath, linkAction, sanitiseAnalyticsUrl } from "../lib/analytics-policy";

function beforeSend(event: BeforeSendEvent) {
  // The script can survive client-side navigation into /admin: guard every event too.
  if (!isPublicAnalyticsPath(window.location.pathname)) return null;
  const url = sanitiseAnalyticsUrl(event.url);
  return url ? { ...event, url } : null;
}

export function PublicAnalytics() {
  const pathname = usePathname();
  const enabled = isPublicAnalyticsPath(pathname);

  useEffect(() => {
    if (!enabled) return;
    trackArrival();
    function onClick(event: MouseEvent) {
      if (event.button !== 0 && event.button !== 1) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const action = linkAction(anchor.href, window.location.origin);
      if (!action) return;
      const location = anchor.closest("header") ? "header" : anchor.closest("footer") ? "footer" : "content";
      trackPublicAction(action, location);
    }
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, [enabled]);

  // Explicit clean paths also prevent the SDK from deriving route names from query values.
  return enabled ? <Analytics
    beforeSend={beforeSend}
    route={pathname}
    path={pathname}
    framework="next"
    basePath={process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH}
    configString={process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG}
  /> : null;
}

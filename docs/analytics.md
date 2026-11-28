# PEWSS website analytics

## Dashboard and setup

Open [PEWSS → Analytics](https://vercel.com/samedifs-projects/pewss/analytics). **Web Analytics is enabled and receiving production data**, verified on 28 November 2026. It uses the included Pro option with two custom-event properties; the team-wide Analytics Plus add-on was not enabled and Samedif was not changed.

Vercel reports estimated visitors, page views, referring websites, countries, devices and browsers. Choose a date range in the dashboard. Country comes from the request's approximate network location, not GPS; VPNs and mobile networks can affect it. Data begins after activation, with no reconstruction of earlier clicks.

## Social links to share

Use the corresponding URL in each social account's biography, post or link:

- Instagram: https://pewss.org/?utm_source=instagram&utm_medium=social&utm_campaign=pewss2027
- Bluesky: https://pewss.org/?utm_source=bluesky&utm_medium=social&utm_campaign=pewss2027
- Facebook: https://pewss.org/?utm_source=facebook&utm_medium=social&utm_campaign=pewss2027

These tags work even when an app hides its referrer. An untagged recognised Instagram, Bluesky or Facebook referrer is also classified. Otherwise traffic is `other` (another referring website) or `direct_or_unknown` (no usable external referrer). A copied tagged link keeps its original label, so this measures the link used rather than proving which app a person was using.

Pro's built-in UTM dashboard requires the separate Plus add-on. This implementation instead reports social attribution through custom event properties, within Pro's two-property limit. In **Events**, hover over **Visit source**, click its **Filter** button, then select **source**. The `method` property distinguishes `tagged_link`, `referrer` and `unavailable`. Other events also carry `source`, so application actions can be compared by social source. Use **Clear** above the chart to return to the overall view.

## Events

| Event | Meaning | Properties |
| --- | --- | --- |
| Visit source | First tracked public page in a document/navigation session | source, method |
| Apply clicked | A link to /apply | source, location |
| Faculty clicked | A link to /faculty | source, location |
| Practical information clicked | A link to /practical-information | source, location |
| Contact clicked | A mail link to the public PEWSS inbox | source, location |
| Application started | First actual form change or submit attempt while applications are open | source, location=form |
| Application submitted | Browser received a successful application API response | source, location=form |

`location` is header, footer, content or form. An application start is counted once per mounted form, not on focus. Errors do not count as successful submissions. The private applicant dashboard remains the authoritative application count: blocked scripts, closed tabs or lost responses can prevent an analytics confirmation even when an application was stored.

Source attribution is held only in JavaScript memory. Next.js internal navigation retains it, but a reload, new tab or later return may lose it unless the URL is still tagged. Visit source is therefore an arrival-event count, not a unique-person or persistent-session count. Ad blockers, browser settings and privacy measures can undercount visits. Development mode logs events locally without transmitting them.

## Privacy and maintenance

- Only /, /apply, /faculty, /practical-information and /privacy are allowed. Private /admin routes, API routes and /login are excluded, including navigation from a public page.
- Page URL queries and fragments are removed before sending. Only the three recognised social-source labels are extracted; arbitrary tag values are never forwarded as custom data.
- No application answers, photos, emails, reference numbers or administrator IDs are added to events. No identity/identify calls, tracking cookies, browser-storage attribution, heatmaps or session recordings are used.
- The public /privacy page and application-form notice explain the setup. Vercel estimates visitors using its daily-changing identifier.
- See `lib/analytics-policy.ts`, `lib/analytics-client.ts` and `app/public-analytics.tsx`. New public routes must be explicitly added to the allowlist to be measured.
- Run `npm run lint`, `node --test tests/*.test.mjs` and `npm run build -- --webpack` before deployment. Browser verification must not send a real applicant email.

Official documentation: [Web Analytics](https://vercel.com/docs/analytics), [custom events](https://vercel.com/docs/analytics/custom-events), [pricing](https://vercel.com/docs/analytics/limits-and-pricing), [filters and UTM availability](https://vercel.com/docs/analytics/filtering), [privacy](https://vercel.com/docs/analytics/privacy-policy).

## Private website dashboard

`/admin/analytics` is linked from the applications page. It uses the existing confirmed-administrator session check before any reporting request. Anonymous requests redirect to `/admin`. The existing admin proxy supplies private/no-store, noindex and no-referrer headers; analytics tracking itself still excludes every admin route.

The server reads `VERCEL_ANALYTICS_TOKEN` and calls Vercel's [official Web Analytics API](https://vercel.com/docs/analytics/web-analytics-api). Every request has a fixed project (`pewss`), team slug (`samedifs-projects`), and Production environment; browser parameters cannot alter them. No credentials are sent to the browser. Requests are GET-only, refuse redirects, time out after 12 seconds and are not cached. Each report uses nine requests. Date presets cover 7/30/90 calendar days; custom ranges use explicit UTC dates with a maximum of 90 days. Match these dates and the Production environment in Vercel to compare values.

Visitor/page-view totals come from the count endpoint rather than summed daily or country counts. Tables show the API's visitor and activity totals. Failed sections show an unavailable message, not a zero. Missing credentials show a connection notice, never sample data. Reports include visitors, views, application starts/confirmations, daily traffic, countries, source labels, pages, referrers, events, devices and browsers. Vercel-only indicators such as live-online status and bounce rate are not reproduced by these documented queries. Application records and email delivery are unaffected.

Connection is pending explicit approval. The inspected Vercel token form offers team scope or full-account scope, without a PEWSS-only/read-only choice. A token for this hosting team would inherit the owner's permissions and could access other team projects including Samedif, even though the application only makes PEWSS analytics reads. Do not create or store that credential without explaining and obtaining approval for the broader scope. If approved, use a dedicated expiring token, store it as a sensitive **Production-only** variable in **pewss**, never in source, chat, preview variables or Samedif, then deploy and verify actual API responses against the dashboard. Record its expiry for renewal without saving the token in these notes.

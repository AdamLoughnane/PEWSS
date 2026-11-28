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

## Poster QR code

Use this destination for new poster QR codes:

`https://pewss.org/apply?utm_source=poster_qr&utm_medium=qr&utm_campaign=pewss2027`

The QR code in `UCC_Poster_Color_A2_3mm_bleed FINAL.pdf` was decoded on 28 November 2026 and contains only `https://pewss.org/apply`. Existing copies cannot identify scans separately from other direct visits. Replace the QR artwork for future distribution; the original PDF has not been altered. Validated replacement assets are in `output/qr/pewss-2027-poster-qr.png` and `.svg` (local deliverables, not part of the deployed website). Preserve the white quiet zone when placing the QR code.

The tagged link records `Visit source` with `source=poster_qr`, and retains that source for subsequent application actions through internal navigation. In Vercel, filter **Visit source → source → poster_qr**. The private dashboard adds **Poster QR visitors** (Vercel's estimated visitors) and **Poster QR arrivals** (event count including repeat arrivals), plus a **Poster QR code** row under **Traffic sources**. Counts follow the selected date range. An unavailable report displays a dash, not zero.

This measures website arrivals through the labelled link, not camera scans that never open the site. Shared copies of the tagged link also count; old untagged visits cannot be attributed retrospectively. Dashboard figures remain unavailable until its pending PEWSS-only token connection is complete. No extra event, API request, cookie, database field or third-party QR service is required.

## Tracked events

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
- Page URL queries and fragments are removed before sending. Only the recognised social-source and poster QR labels are extracted; arbitrary tag values are never forwarded as custom data.
- No application answers, photos, emails, reference numbers or administrator IDs are added to events. No identity/identify calls, tracking cookies, browser-storage attribution, heatmaps or session recordings are used.
- The public /privacy page and application-form notice explain the setup. Vercel estimates visitors using its daily-changing identifier.
- See `lib/analytics-policy.ts`, `lib/analytics-client.ts` and `app/public-analytics.tsx`. New public routes must be explicitly added to the allowlist to be measured.
- Run `npm run lint`, `node --test tests/*.test.mjs` and `npm run build -- --webpack` before deployment. Browser verification must not send a real applicant email.

Official documentation: [Web Analytics](https://vercel.com/docs/analytics), [custom events](https://vercel.com/docs/analytics/custom-events), [pricing](https://vercel.com/docs/analytics/limits-and-pricing), [filters and UTM availability](https://vercel.com/docs/analytics/filtering), [privacy](https://vercel.com/docs/analytics/privacy-policy).

## Private website dashboard

`/admin/analytics` is linked from the applications page. It uses the existing confirmed-administrator session check before any reporting request. Anonymous requests redirect to `/admin`. The existing admin proxy supplies private/no-store, noindex and no-referrer headers; analytics tracking itself still excludes every admin route.

The server reads `VERCEL_ANALYTICS_TOKEN` and calls Vercel's [official Web Analytics API](https://vercel.com/docs/analytics/web-analytics-api). Every request has a fixed project (`pewss`), team slug (`samedifs-projects`), and Production environment; browser parameters cannot alter them. No credentials are sent to the browser. Requests are GET-only, refuse redirects, time out after 12 seconds and are not cached. Each report uses nine requests. Date presets cover 7/30/90 calendar days; custom ranges use explicit UTC dates with a maximum of 90 days. Match these dates and the Production environment in Vercel to compare values.

Visitor/page-view totals come from the count endpoint rather than summed daily or country counts. Tables show the API's visitor and activity totals. Failed sections show an unavailable message, not a zero. Missing credentials show a connection notice, never sample data. Reports include visitors, views, application starts/confirmations, daily traffic, countries, source labels, pages, referrers, events, devices and browsers. Vercel-only indicators such as live-online status and bounce rate are not reproduced by these documented queries. Application records and email delivery are unaffected.

Use a **project-scoped PEWSS token only**. The Scope selector first shows the hosting team; selecting that team opens a second list containing All Projects, pewss and samedif. Select **pewss**, never All Projects or Full Account. The earlier conclusion that only team-wide scope was available was incorrect. Vercel's [access-token documentation](https://vercel.com/docs/accounts/access-tokens) states that a project token denies requests to other projects and team/user-level resources, and cannot mint other tokens. It can read/write PEWSS resources, so it is not an analytics-only credential, but it must never grant access to Samedif.

On 28 November 2026, Adam authorised creation only with this isolation. Vercel now lists **PEWSS analytics dashboard**, scope **pewss**, expiry **28 November 2027**: creation and project scope are confirmed. Its one-time token value is no longer visible, and `VERCEL_ANALYTICS_TOKEN` is absent from PEWSS's environment-variable list. Asked whether Adam retained the value; do not request it in chat. Save it as a sensitive **Production-only** `VERCEL_ANALYTICS_TOKEN` variable in **pewss**, never in source, chat, preview variables or Samedif. If the value was not retained, a replacement PEWSS-only token is needed. Deploy and verify actual analytics responses against Vercel after connection. Do not work around an API permission failure by widening the scope.

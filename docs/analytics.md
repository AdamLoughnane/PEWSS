# PEWSS website analytics

## Dashboard and setup

Open [PEWSS → Analytics](https://vercel.com/samedifs-projects/pewss/analytics). Enable **Web Analytics** for this project if it is not already enabled, and deploy after enablement so Vercel serves its analytics endpoints. Use the existing Pro plan; do not enable the team-wide Analytics Plus add-on or change Samedif.

Vercel reports estimated visitors, page views, referring websites, countries, devices and browsers. Choose a date range in the dashboard. Country comes from the request's approximate network location, not GPS; VPNs and mobile networks can affect it. Data begins after activation, with no reconstruction of earlier clicks.

## Social links to share

Use the corresponding URL in each social account's biography, post or link:

- Instagram: https://pewss.org/?utm_source=instagram&utm_medium=social&utm_campaign=pewss2027
- Bluesky: https://pewss.org/?utm_source=bluesky&utm_medium=social&utm_campaign=pewss2027
- Facebook: https://pewss.org/?utm_source=facebook&utm_medium=social&utm_campaign=pewss2027

These tags work even when an app hides its referrer. An untagged recognised Instagram, Bluesky or Facebook referrer is also classified. Otherwise traffic is `other` (another referring website) or `direct_or_unknown` (no usable external referrer). A copied tagged link keeps its original label, so this measures the link used rather than proving which app a person was using.

Pro's built-in UTM dashboard requires the separate Plus add-on. This implementation instead reports social attribution through custom event properties, within Pro's two-property limit. Open **Visit source** in Events and inspect `source`; `method` distinguishes `tagged_link`, `referrer` and `unavailable`. Other events also carry `source`, so application actions can be compared by social source.

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

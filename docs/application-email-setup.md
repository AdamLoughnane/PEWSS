# Application email setup

The application form at `/apply` sends submissions to **adam.loughnane@ucc.ie** through Resend. The recipient is fixed on the server; the applicant's email address becomes Reply-To. An optional JPEG, PNG, or WebP photograph (maximum 2 MB) is attached after file-type, size, and consent checks.

## Project isolation

The user also operates Samedif using Cloudflare, Resend, and Vercel. Keep all PEWSS resources separate. Use only the Cloudflare zone `pewss.org`, the Resend sending domain `mail.pewss.org` in Ireland with a dedicated sending-only domain-scoped key, and project-scoped production variables and rules in Vercel's `samedifs-projects/pewss` project. The Vercel team name is shared; that does not authorise changes to team-wide settings or any other project. Never reuse Samedif credentials or change its DNS, sending domains, firewall rules, or environment variables.

## Activate delivery

1. Create or use the organiser's Resend account, and verify a sending domain that PEWSS controls, for example `mail.pewss.org`. Add the exact DNS records supplied by Resend. Do not change the UCC domain or its mail records.
2. Create a sending API key scoped to that domain. Add these **server-side** environment variables to the existing Vercel project (`samedifs-projects/pewss`), or to ignored `.env.local` for local testing:

   ```dotenv
   RESEND_API_KEY=<sending API key>
   APPLICATION_FROM_EMAIL=PEWSS Applications <applications@mail.pewss.org>
   APPLICATIONS_OPEN=true
   ```

   Use a From address on the domain actually verified. Do not prefix these variables with `NEXT_PUBLIC_`, commit keys, or paste secrets into chat. Keep `APPLICATIONS_OPEN=false` while preparing the service.

3. The form includes a honeypot and rejects cross-origin requests, but those checks alone do not stop scripted spam. Optional additional protection is a Vercel project firewall rule matching only `POST /api/applications`, limited to 10 requests per minute per IP. Vercel displays metered pricing for that feature; the prepared rule was cancelled at the pricing prompt and has not been enabled. Obtain approval for the additional usage charges before adding it, and never change team-wide or Samedif rules.
4. Redeploy after configuring environment variables. Submit a clearly labelled test application, including a small photo, and check the UCC inbox and spam folder. Confirm that Reply works and the attachment opens. A successful Resend API response means the email was accepted for delivery; it does not independently establish inbox receipt. Check Resend delivery/bounce logs if the email does not arrive.
5. Confirm the application dates, fees, and institutional privacy/retention arrangements before publicly opening recruitment. The form explains its current data flow; it does not invent a UCC retention policy. The homepage uses the same configuration check as the form and displays “Applications are open” and “Apply now” after a build with all three production variables configured. Redeploy whenever opening or closing applications so the static homepage and application form agree.

If any setting is missing, or `APPLICATIONS_OPEN` is not exactly `true`, the page shows the questions as a preview and disables Submit. The server also rejects submissions. Set the flag to `false` and redeploy to close applications.

## Current behaviour

- Applicants receive an on-page confirmation and a reference after Resend accepts the email. No automatic email is sent to the applicant in this version.
- Entries remain in the browser if validation or delivery fails. Retrying unchanged entries reuses a Resend idempotency key to avoid duplicate emails within the provider's 24-hour window.
- Application records are the received emails. No database, applicant account, or public profile is created. A database and applicant confirmation emails remain later work from the wider project brief.
- Photograph and affiliation are optional. All other core fields, career stage, ECTS choice, and privacy acknowledgement are required; website and ORCID are optional. Photograph permission is required when a photo is supplied and does not authorise publication.
- Health, accessibility, and dietary details are deferred. Applicant data and email-provider responses are not written to application logs. Uploaded files are not saved into the repository or public website.

## Verification

`node --test tests/applications.test.mjs` exercises server validation, upload limits, consent, HTML escaping, fixed delivery destination, retry keys, disabled/cross-origin requests, and provider failures using a mock email service. It sends no real email. Run `npm run lint` and `npm run build -- --webpack` for the application checks.

Provider documentation: [Next.js integration](https://resend.com/docs/send-with-nextjs), [verified domains](https://resend.com/docs/dashboard/domains/introduction), [email API](https://resend.com/docs/api-reference/emails/send-email).

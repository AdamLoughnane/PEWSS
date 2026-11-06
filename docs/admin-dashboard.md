# PEWSS administrator dashboard

The implementation is at `/admin`. Only the confirmed Supabase user whose ID matches `PEWSS_ADMIN_USER_ID` **and** whose email is `adam.loughnane@ucc.ie` may view records or send decisions. Applicants do not receive accounts. Public and authenticated Supabase roles have no access to the application tables or database functions. All data access goes through authorised server code. Sign-in uses a one-time email code; no public signup is provided.

## Dedicated infrastructure

- Supabase organisation: **PEWSS**, free plan, ID `yddvxkgtyhfqixkwfwom`.
- Supabase project: **pewss**, ID `gyvbqelmteprnwxachfe`, West EU (Ireland), `https://gyvbqelmteprnwxachfe.supabase.co`.
- Vercel: only **samedifs-projects/pewss**.
- Resend: only **mail.pewss.org**, using domain-restricted sending keys.
- Samedif projects, credentials, DNS and settings must remain untouched.

The schema in `supabase/migrations/202611060001_admin.sql` creates private application, decision, and login-rate-limit tables plus atomic decision functions. It was applied to the new PEWSS database on 6 November 2026. Photographs are stored privately in the same database transaction as their application, not in public storage. They are served only through an authenticated, uncached endpoint. The 2 MB per-photo limit remains. Monitor database usage as applications grow; base64 photo storage uses roughly 4/3 of the original image size.

## Production activation checklist

1. Use a PEWSS-only Supabase secret key and publishable key. Add these server variables **only** to production in Vercel's `pewss` project:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` — sensitive secret, never public or committed
   - `PEWSS_ADMIN_USER_ID` — the organiser's Supabase Auth user UUID
   - `APPLICATION_STORAGE_ENABLED=true` — only after database setup is verified
2. Configure Supabase email OTPs: change the Magic Link email template to include `{{ .Token }}`. Use a dedicated Resend key restricted to `mail.pewss.org` for SMTP (`smtp.resend.com`, port 465, username `resend`, key as password, sender `applications@mail.pewss.org`). The existing application email key in Vercel remains separate.
3. Create/invite only `adam.loughnane@ucc.ie`, record that user's UUID, disable public signups, and retain email confirmation. Keep anonymous login and unrelated providers disabled. Set the Site URL to `https://pewss.org/admin`. Use a short OTP expiry (10 minutes).
4. Deploy the tested code. Confirm anonymous requests cannot access applicant details, photos, imports or decision endpoints. Sign in using the organiser's code and verify list, filters, review, and sign-out.
5. Submit a clearly labelled test through the public form. Confirm a record exists, review its responses, and send a clearly labelled test decision only to the organiser. Verify Resend acceptance and the saved decision. Do not decide any real applicant's outcome during testing.

This document describes setup requirements; consult the deployment record in PROJECT_CONTEXT.md for what has actually been activated. Never treat the checklist itself as proof of completed configuration.

## Application and decision behaviour

When storage is enabled, submission validation runs first, then the application is saved before attempting its notification email. If saving fails, no email is sent and the applicant receives a retry message. If only the organiser notification fails, the applicant still receives confirmation because the record is safely in the dashboard. The review page identifies an unconfirmed organiser notification. The original fixed organiser recipient and photograph consent rules are preserved.

The dashboard lists 50 records per page, with name/email/institution search and pending/accepted/rejected filters. Each review page shows all responses and private photo. Accept and Reject prepare editable email drafts. The organiser must review the recipient, subject and body and explicitly confirm sending. The API takes the recipient from the stored application, never from a submitted recipient field.

Each application has at most one decision. A database lock prevents concurrent accept/reject sends. After the first attempt the email payload, recipient and idempotency key are immutable. An interrupted send can retry the same message safely within 23 hours. After that, sending is blocked until a maintainer checks Resend; do not remove the decision or change its key to force a retry. Resend retains idempotency keys for 24 hours. Status changes only after provider acceptance and successful transactional persistence. The UI says accepted for delivery, not read or delivered to the inbox.

If a decision needs correction after it is sent, handle that explicitly with the organiser; this first version deliberately does not send replacement decisions automatically. An uncertain send older than the retry window also requires manual reconciliation with Resend using the stored decision ID and recipient. Retain the original message and audit record.

## Earlier emailed applications

`/admin/import` accepts the labelled body of an original PEWSS notification email, previews all extracted fields, requires the original received date and any photo attachment, and validates the fields again on the server. Import sends no email and records no decision. References prevent duplicate records. The screen does not access the organiser's mailbox automatically; earlier emails must be imported before the list can be considered complete.

## Verification

- `npm run lint`
- `node --test tests/*.test.mjs`
- `npm run build -- --webpack`

Tests use mock email delivery and an embedded Postgres database to check access restrictions, input validation, private record persistence, immutable decisions, concurrent-send locking, retry expiry and email parsing. They do not send real applicant emails. Next.js was updated to 16.4.5 after the production dependency audit reported vulnerabilities in the prior release. Supabase libraries are pinned to Node 20 compatible versions. The production dependency audit is clean.

References: [Supabase server-side auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs), [email OTPs](https://supabase.com/docs/guides/auth/auth-email-passwordless), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).

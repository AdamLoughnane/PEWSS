# PEWSS administrator dashboard

`/admin` is restricted to the verified organiser email `adam.loughnane@ucc.ie` and the preserved ID `08e4779b-748b-43f3-b83e-9c1df4ef2b5a`. Applicants have no accounts. Better Auth runs in the existing Next.js server, with private PostgreSQL tables on Neon. The custom endpoint accepts only organiser email-code login and logout; there is no public signup or catch-all authentication handler. A database constraint also prevents adding other users. Eight-digit codes expire after ten minutes, are stored as keyed hashes, and allow at most five guesses. Sessions last seven days, use Secure/HttpOnly/SameSite cookies, and are checked in the database on every protected request.

## Dedicated infrastructure

- Neon project **PEWSS**, `twilight-mountain-71794522`, free plan, AWS Frankfurt (`aws-eu-central-1`).
- Production branch `br-curly-mode-bahfxf8v`, database `pewss`.
- Vercel: only **samedifs-projects/pewss**.
- Resend: only **mail.pewss.org**; the existing application sender also delivers organiser sign-in codes.
- The old PEWSS Supabase project `gyvbqelmteprnwxachfe` is retained as a migration source/rollback copy. Consult PROJECT_CONTEXT.md for actual cutover status.
- Samedif resources, DNS, credentials, and shared team settings must remain untouched.

The ordered SQL files under `database/migrations/` create the application/decision tables, atomic decision functions, Better Auth tables and restricted server role policies. Role `pewss_app` has no superuser, role-creation, database-creation or RLS-bypass privileges. Use it for runtime access; `pewss_owner` is for migrations only. Every table has RLS, and PUBLIC has no table/function access. No public Data API is enabled.

Photographs are stored privately in the same transaction as their application, served only through an authenticated, uncached endpoint. The 2 MB limit remains. Base64 uses roughly 4/3 of image size; monitor storage as applications grow. Free-plan allowances can change and have capacity limits. Idle compute sleeps and wakes on a connection; no keep-alive job is needed. Do not enable a paid plan without the owner's approval.

## Production configuration

Set these server variables only in the PEWSS Vercel production environment:

- `DATABASE_URL`: sensitive secret, restricted `pewss_app` role, pooled Neon host.
- `BETTER_AUTH_SECRET`: sensitive random secret, at least 32 characters.
- `BETTER_AUTH_URL=https://pewss.org`.
- `PEWSS_ADMIN_USER_ID=08e4779b-748b-43f3-b83e-9c1df4ef2b5a`.
- `APPLICATION_STORAGE_ENABLED=true`, `APPLICATIONS_OPEN=true`.
- Existing `RESEND_API_KEY` secret and `APPLICATION_FROM_EMAIL`.

TLS certificate checking stays enabled. Vercel's pool lifecycle helper closes idle connections during function suspension. Supabase environment variables are unused by this version; retaining them temporarily permits rollback. Old Supabase cookies do not grant access: the organiser signs in again after cutover.

## Migration and recovery

1. Export applications and decisions together from the original Supabase project, including private `photo` JSON. Store outside version control with restricted file permissions.
2. Apply schema migrations to the new, empty Neon database as owner. Never re-run them over a live database; test later schema changes on an isolated Neon branch.
3. Use `database/migrate-data.mjs PRIVATE_BACKUP.json` with a direct `NEON_OWNER_URL` loaded from a gitignored environment file. It imports inside one transaction and compares every field, timestamp and attachment using PostgreSQL record equality. It refuses mismatches or differing record counts; it does not send emails or overwrite existing rows.
4. Once code, environment and tests are ready, run `database/cutover-supabase.sql` in the old PEWSS project. It locks both data tables, refuses unresolved decision sends, and blocks further writes while keeping all data readable. Take a final export and repeat the exact comparison before deployment.
5. Deploy, verify anonymous access protection, sign in with the organiser's real code, and inspect records/photos/history. Test mail only to the organiser; never decide a real applicant's outcome as a test.
6. Retain the source and private backup. A rollback after new Neon submissions requires stopping new writes and copying the new records/decisions back first; simply reverting the deployment would lose visibility of new data. Disable source freeze triggers only after reconciliation.

For ongoing backups use `pg_dump` with a direct owner connection and protect the resulting files. Restore into a separate database and verify counts before changing production. Neon free history is limited; a pre-migration copy is not a backup of later submissions. Never commit backups, credentials, or applicant data.

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
- `npm audit --omit=dev`

Tests cover application validation/persistence, private database permissions, immutable decisions and bounded retries, import parsing, organiser-only access, OTP expiry/replay/attempt limits, secure sessions and logout. Email delivery is mocked in automated tests. A separate pre-cutover check exercised real Neon pooled connections and database-backed authentication without sending mail. See PROJECT_CONTEXT.md for the final live checks.

References: [Neon connections](https://neon.com/docs/connect/connection-pooling), [Better Auth email codes](https://better-auth.com/docs/plugins/email-otp), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).

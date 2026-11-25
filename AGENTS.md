<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## PEWSS — read before working

- Project brief and full decision history: `PROJECT_CONTEXT.md`. Operations guides: `docs/`. ChatGPT's 25 Nov 2026 handover (`docs/HANDOVER-chatgpt-2026-11-25.md`) is background only and partly out of date.
- Stack: Next.js 16 App Router, TypeScript, Tailwind 4 / CSS modules; Neon Postgres + Better Auth (admin only); Resend on `mail.pewss.org`; Vercel project `samedifs-projects/pewss` (a push to `main` deploys to production); Cloudflare DNS; email `info@pewss.org` on Purelymail.
- Keep PEWSS separate from all Samedif resources.
- Never commit `.env*`, `.migration-private/`, backups or applicant data.
- Ask Adam before changing DNS, Vercel settings, the database schema, or sending any applicant email.
- British/Irish English. The theme is written "(non)Self and Space". Don't invent faculty, fees, deadlines or ECTS details.
- At the end of each session, add a dated section to `PROJECT_CONTEXT.md`.

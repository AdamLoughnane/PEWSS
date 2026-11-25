> **Note added 25 November 2026 (Claude):** this is ChatGPT's historical handover, kept as background. It is out of date in places. The backend is **Neon + Better Auth** (migrated from Supabase on 15 Nov 2026), not Supabase. Applications, the admin dashboard and Resend email are **live**. The theme is written **"(non)Self and Space"**. Email is **info@pewss.org on Purelymail** (set up 25 Nov 2026). For current facts, see `PROJECT_CONTEXT.md` and the code.

# PEWSS — Website development and project handover report

**Project:** Phenomenology East and West Summer School  
**Website:** https://pewss.org  
**Project owner:** Adam Loughnane, University College Cork  
**Inaugural event:** 26–29 May 2027  
**Report date:** 25 November 2026  
**Purpose:** Chatbot-agnostic project continuity, technical documentation and development handover.

## 1. Purpose of this report

This portable source of project context enables a new AI assistant, coding agent or human developer to understand PEWSS without access to previous ChatGPT conversations. It covers academic identity, development history, architecture, DNS, hosting, design, applications, email, outstanding tasks and recovery. Completed work is distinguished from proposals and unverified implementation. Subsequent development through Codex or other environments may have changed the project.

## 2. Project identity and academic context

| Field | Details |
|---|---|
| Full name | Phenomenology East and West Summer School |
| Acronym | PEWSS (pronounced “pews”) |
| Domain | pewss.org |
| Host | University College Cork, Ireland |
| Frequency | Annual |
| First iteration | 2027 |
| Audience | MA and PhD students, early-career researchers and practitioners |
| Orientation | Phenomenology, East Asian philosophy and intercultural philosophy |
| Associated journal | Journal of Aesthetics and Phenomenology |

PEWSS is intended to become an internationally recognised recurring graduate-level summer school bringing European phenomenology into dialogue with East Asian philosophical traditions. The website is its permanent institutional home, not a temporary event site.

### Inaugural event

26–29 May 2027 at UCC. International specialists, intensive seminars and close-reading groups, small-group workshops, student presentations on day one, keynote lectures, experiential and embodied inquiry, graduate ECTS credit, and an essay competition with the winning essay selected for publication in the Journal of Aesthetics and Phenomenology. The final balance of lectures, workshops and experiential sessions remains subject to academic planning.

### Evolution of theme

- Original: **Space and Technē** — space, embodiment, technology, architecture, movement, AI, robotics, performance and spatial humanities.
- Revised: **(Non-)Self and Space** — alternatives to the self as a discrete subject contained within independently existing space, bringing Western phenomenology into dialogue with East Asian traditions challenging substantialised selfhood.

The revised theme supersedes the original. Do not inadvertently restore old copy. Verify exact capitalisation against the live website.

## 3. Executive technical summary

| Component | Technology | Status |
|---|---|---|
| Domain | pewss.org | Established |
| DNS | Cloudflare | Configured |
| Hosting | Vercel | Configured |
| Source control | GitHub | Configured |
| Framework | Next.js App Router | Established |
| Language | TypeScript | Established |
| Styling | Tailwind CSS | Established |
| Database | Supabase | Proposed; verify |
| Authentication | Supabase Auth | Proposed |
| Storage | Supabase Storage | Proposed |
| Email | Undecided | Last known pending |
| Development | macOS, ChatGPT/Codex | Established |

Architecture: local development → GitHub (`AdamLoughnane/PEWSS`, `main`) → Vercel automatic deployment → public website at `pewss.org`. Cloudflare provides DNS resolution, not application hosting. Supabase is a proposed backend, not verified as implemented.

## 4. Development history

### Phase 1 — Conceptual planning and branding (September 2026)

Established name and acronym. Prioritised launching within weeks. Version 1: polished public website and straightforward applications, without accounts. Later versions: participant management, faculty, submissions, credits and annual iterations. Avoid unnecessary engineering before the inaugural event.

### Phase 2 — Domain selection

`pewss.com` was already registered. Selected and registered `pewss.org`, appropriate for a recurring academic initiative. Established Cloudflare DNS management.

### Phase 3 — Technology selection

Next.js, TypeScript, Tailwind, GitHub and Vercel selected for rapid development, low costs, version control, automatic deployment, AI-agent compatibility and independence from proprietary site builders. Supabase identified for relational data, authentication and private storage without a separately maintained server.

### Phase 4 — Local development environment

Project created at `~/Developer/PEWSS` using Next.js App Router. Node.js 18 was incompatible with the Next.js version reported at the time (16.3.6); Node was upgraded. Verify current version rather than assuming it.

Apple Silicon Tailwind native dependency error involving `@tailwindcss/oxide-darwin-arm64` resolved using:

```bash
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

Historical troubleshooting only: deleting the lockfile can change dependencies. Local server established at http://localhost:3000.

### Phase 5 — GitHub repository

- Account: `AdamLoughnane`
- Repository: `PEWSS`
- URL: https://github.com/AdamLoughnane/PEWSS
- Remote: `https://github.com/AdamLoughnane/PEWSS.git`
- Branch: `main`

Git initialised, remote typo corrected, GitHub CLI installed through Homebrew and authenticated, initial push succeeded. Private repository recommended; screenshot appeared public. Verify visibility and absence of credentials or applicant data in history.

### Phase 6 — Vercel deployment

Imported GitHub repository into a separate PEWSS project in existing paid workspace **Samedif's projects**. Avoided an additional Pro subscription; Hobby usage restrictions were discussed. PEWSS remains distinct from Samedif.

| Setting | Value |
|---|---|
| Workspace | Samedif's projects |
| Project | pewss |
| Framework | Next.js |
| Repository | AdamLoughnane/PEWSS |
| Production branch | main |
| Root | ./ |
| Initial environment variables | None |
| Default domain | pewss.vercel.app |

Historical deployment URL: `https://pewss-lvwmqqz5q-samedifs-projects.vercel.app`. Vercel GitHub App permissions were adjusted to include PEWSS. Pushes to main trigger production deployments.

### Phase 7 — Homepage implementation

Custom architectural hero and restrained editorial design implemented in `app/page.tsx`: full-screen image, navigation, title, dates, location, application button and introduction. Original theme was Space and Technē. Subsequent development expanded programme, faculty, essay competition and institutional content. Recover exact implementation from repository.

### Phase 8 — Custom domain

Added root and www domains to Vercel and Cloudflare. Reversed initial root-to-www redirect so `pewss.org` serves production and `www.pewss.org` permanently redirects to root. Both were shown valid during setup; website reported publicly accessible.

### Phase 9 — Theme revision and promotional design (October 2026)

Changed theme to (Non-)Self and Space; revised academic descriptions and promotional copy. Retained East–West architectural visual identity. Poster design proceeded in parallel, using revised website content.

### Phase 10 — Email investigation (October–November 2026)

Selected `info@pewss.org` with sending and receiving required. Compared free and inexpensive providers. Preferred Zoho Mail Lite; Purelymail cheaper alternative. As of 4 November, no mailbox confirmed established through this workflow.

## 5. Domain and DNS configuration

Cloudflare manages DNS; Vercel hosts the application.

| Type | Name | Target | Proxy | TTL |
|---|---|---|---|---|
| CNAME | @ | 6433af7dbf474e97.vercel-dns-016.com | DNS only | Auto |
| CNAME | www | 6433af7dbf474e97.vercel-dns-016.com | DNS only | Auto |

Target supplied by Vercel; verify current recommendation before recreating. Grey cloud, not proxied.

| Vercel domain | Configuration |
|---|---|
| pewss.org | Production |
| www.pewss.org | 308 Permanent Redirect to pewss.org |
| pewss.vercel.app | Default production domain |

Vercel manages HTTPS; no separate certificate purchase required.

Dashboards: https://dash.cloudflare.com, https://vercel.com/dashboard, https://github.com/AdamLoughnane/PEWSS, https://supabase.com/dashboard (if implemented). No secrets included.

## 6. Visual identity and design

Sophisticated academic/cultural editorial aesthetic, not corporate conference design. Architectural space, intercultural dialogue, large editorial typography, restrained palette, natural materials, generous spacing and balance of historical and contemporary traditions. Audience extends to architecture, aesthetics and related disciplines.

### Hero image

Selected custom image combines Japanese timber and shoji-like architecture, contemporary concrete, European classical arches and domes, reflective water, rocks, trees and subtle digital wireframe. Approximately 1536 × 1024 pixels, originally `public/pewss-hero.jpg`, referenced as `/pewss-hero.jpg`. Verify subsequent replacements or optimised assets.

Proposed subtle animation: rippling water, moving trees and clouds, atmospheric changes; not distracting. Initially static. Later discussions refer to animation but implementation unverified.

### Typography and palette

Large serif theme typography, uppercase letter-spaced institutional heading and navigation; white hero text over semi-transparent black overlay.

| Colour | Hex |
|---|---|
| Warm ivory | #EEE9DF |
| Charcoal | #24231F |
| Muted stone | #4D4A43 |

Original Tailwind serif/sans utilities; verify actual font families in layout and CSS. Poster and website share identity; preserve Greek architecture on right and East Asian architecture on left unless redesign explicitly requested.

## 7. Information architecture

Initial intended structure (not a verified route inventory):

- `/`: hero, introduction, format, annual theme, faculty, programme, essay competition, graduate credit, eligibility, Cork/UCC, application CTA, footer/contact/legal information.
- `/faculty`: initially “Faculty information coming soon.” Keynote research included Bret W. Davis and other prominent scholars; recommendations are not confirmed invitations or participation.
- `/apply`: straightforward initial application form without accounts. Submission mechanism, database integration and notifications require inspection.
- Future: annual programmes and archives, participant portal, administrative dashboard.

## 8. Original homepage implementation

Historical foundation, not current production source. Schematic structure:

```text
PEWSS/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── faculty/page.tsx
│   └── apply/page.tsx
├── public/pewss-hero.jpg
├── package.json
└── package-lock.json
```

Original hero:

```tsx
<section
  className="relative min-h-screen bg-cover bg-center text-white"
  style={{ backgroundImage: "url('/pewss-hero.jpg')" }}
>
  <div className="absolute inset-0 bg-black/30" />
  {/* Navigation and hero content */}
</section>
```

Navigation used `import Link from "next/link";`, anchors `#about`, `#theme`, `#programme`, and routes `/faculty`, `/apply`.

Institutional heading enlarged from “Phenomenology East and West” to:

```tsx
<p className="mb-7 max-w-4xl text-2xl font-medium leading-tight tracking-[0.12em] uppercase md:text-3xl lg:text-4xl">
  Phenomenology East and West Summer School
</p>
```

Theme heading originally `text-6xl md:text-8xl lg:text-9xl`; proposed reduction to `text-5xl md:text-7xl lg:text-8xl` or `text-5xl md:text-6xl lg:text-7xl`. Final choice unrecorded. Permanent institutional identity should be prominent relative to annual theme.

## 9. Academic website content

Original question (superseded): “How do the spaces we inhabit shape our experience—and how are those spaces transformed by technology?”

Revised conceptual description supplied by project owner:

> For over a century, Western phenomenology has been searching for an alternative to a self conceived as a subject contained in space. As this project has evolved, it has come into dialogue with much older philosophic traditions from Asia, many of which began with the alternatives to selves and space, sought in the West.

Student presentations and close-reading groups continue this dialogue, challenging reified notions of selfhood and space. Current approved website and promotional copy take precedence over drafts.

Use scholarly but accessible British/Irish English (programme, organised, recognised, centre). Preserve terminology and diacritics. Dates: **26–29 May 2027**. Location: **University College Cork, Ireland**.

## 10. Application management and future backend

Priority: public academic identity and simple applications before comprehensive management. Supabase preferred for PostgreSQL and associated services.

Proposed architecture (unverified): prospective participant → application form → Next.js server validation/submission → database, private file storage and email notifications → administrative review.

Suggested fields, not approved or implemented schema:

| Field | Purpose |
|---|---|
| Application ID | Unique identifier |
| Event year | Annual iteration |
| First and last name | Identification |
| Email | Correspondence |
| Institution | Affiliation |
| Academic status | MA, PhD, ECR, practitioner |
| Research interests | Suitability |
| Motivation statement | Assessment |
| Presentation proposal | Planning |
| Credit requirements | Credit administration |
| Application status | Review and acceptance |
| Submission date | Tracking |

Reconcile with existing form before migration. Longer-term possibilities: accounts/profiles, review and acceptance, faculty profiles, sessions, papers, essay submissions, feedback, credit administration, private documents, communications and archives. Do not assume implementation.

GDPR: establish controller, legal basis, retention, access permissions and privacy notice in accordance with UCC policies. Never store applicant records in public repositories or buckets. Supabase service-role credentials must remain server-side. No completed GDPR review is claimed.

## 11. Professional email infrastructure

Agreed `info@pewss.org` must send and receive. Forwarding alone insufficient.

| Provider | Previously discussed annual cost | Functionality |
|---|---|---|
| Cloudflare Email Routing | Free | Incoming only |
| Zoho Mail Free | Free where available | Full mailbox |
| Zoho Mail Lite | €12–€15 | Full mailbox |
| Purelymail | $10 | Full mailbox |
| Migadu | $19 | Multiple addresses, limits |
| Namecheap Private Email | €12–€24 | Full mailbox |
| Fastmail | $60 | Premium |
| Google Workspace | €84 | Gmail/productivity |
| Microsoft 365 Business Basic | €72 | Outlook/productivity |

Indicative October 2026 prices, not verified Irish checkout prices. Preferred Zoho Mail Lite; Purelymail lowest-cost alternative. UCC IT support also discussed, no arrangement established.

As of 4 November: address and requirements selected, providers compared, no mailbox or email DNS confirmed. Verify before purchasing.

Future setup: obtain provider-specific MX (incoming routing), SPF (authorised senders), DKIM (authentication), DMARC (policy/reporting), verification TXT/CNAME records. Preserve website CNAMEs. Optional aliases `applications@pewss.org`, `faculty@pewss.org`, `admin@pewss.org` can potentially deliver to main mailbox.

## 12. Development and deployment workflow

Local edits → local testing → Git commit → GitHub push → Vercel automatic build/deploy → verify pewss.org. ChatGPT SUMMER SCHOOL project contains planning context, not actual source. Any coding agent can use repository plus documentation.

Existing Mac:

```bash
cd ~/Developer/PEWSS
 git status
 git remote -v
 git branch --show-current
```

If no conflicting changes:

```bash
git pull origin main
npm ci
npm run dev
```

Open http://localhost:3000. New computer:

```bash
git clone https://github.com/AdamLoughnane/PEWSS.git
cd PEWSS
npm ci
npm run dev
```

Authentication may be required. Determine Node version from repository. Restore required environment variables securely.

Original deployment workflow:

```bash
git add .
git commit -m "Describe website changes"
git push origin main
```

Inspect changed files before committing; exclude secrets and personal data. Prefer feature branches and preview deployments for substantial changes.

Troubleshooting:

```bash
node --version
npm --version
git status
git log --oneline -15
npm run build
```

Consult package.json before assuming lint/test scripts exist.

## 13. Costs and infrastructure ownership

Annual domain registration (cost/renewal date unrecorded), existing Cloudflare DNS and GitHub account, existing Samedif Pro Vercel workspace, proposed Supabase (plan unverified), email pending, owner-managed AI-assisted development. Avoided separate Vercel subscription. Long-term institutional growth may warrant dedicated organisational accounts or ownership transfer; not required for initial launch.

## 14. Status and outstanding work

Established/completed: identity, domain, DNS, GitHub, Vercel deployment, custom domain/HTTPS, homepage design, revised theme.

Verify: application submission handling, faculty/programme content, Supabase, email (last known pending), privacy/GDPR. Administrative portal proposed.

### Handover checklist

- [ ] Audit GitHub repository: production code, routes, dependencies and recent changes.
- [ ] Verify application submission end to end, including data storage.
- [ ] Establish info@pewss.org if not already established.
- [ ] Verify faculty and programme information.
- [ ] Review privacy and GDPR requirements.
- [ ] Test mobile/desktop responsiveness, accessibility, navigation and forms.
- [ ] Review SEO, social sharing, metadata, Open Graph image, sitemap and indexing.
- [ ] Establish durable project documentation in GitHub.

## 15. Chatbot-agnostic workflow

Make the GitHub repository the authoritative source of project knowledge, not any chatbot's conversation history. AI assistants should be interchangeable.

### Proposed documentation structure

```text
PEWSS/
├── README.md              # Overview and quick start
├── AGENTS.md              # Tool-independent AI instructions
├── .env.example           # Variable names, no secrets
├── CHANGELOG.md           # Significant changes
└── docs/
    ├── PROJECT_CONTEXT.md # Academic identity and objectives
    ├── ARCHITECTURE.md    # Stack, services and data flows
    ├── DEPLOYMENT.md      # GitHub, Vercel, DNS, recovery
    ├── DESIGN_SYSTEM.md   # Typography, colours, imagery
    ├── CONTENT.md         # Approved copy and conventions
    ├── STATUS.md          # Implementation and tasks
    ├── HANDOVER.md        # Historical report
    └── decisions/        # Architecture decision records
```

Start with README, AGENTS, HANDOVER and STATUS. Proposed structure, not existing files.

Authority hierarchy: current source code (actual behaviour), deployment configuration (production), approved documentation (intended behaviour), ADRs (rationale), status/changelog (changes and outstanding tasks), historical AI conversations (background).

### Suggested retrospective ADRs

| ADR | Decision |
|---|---|
| 0001 | Next.js, TypeScript, Tailwind |
| 0002 | GitHub authoritative source |
| 0003 | Existing Vercel Pro workspace |
| 0004 | Cloudflare DNS, root canonical domain |
| 0005 | Minimal public website before full platform |
| 0006 | Supabase preferred future backend |
| 0007 | Permanent annual identity independent of themes |
| 0008 | Professional sending and receiving mailbox |

### Draft AGENTS.md

# PEWSS — AI Agent Instructions

#### Project

PEWSS is the Phenomenology East and West Summer School, an annual international graduate-level academic initiative hosted at University College Cork, Ireland.

The production website is https://pewss.org.

The inaugural event takes place on 26–29 May 2027. Its revised academic theme is (Non-)Self and Space. The original theme, Space and Technē, has been superseded.

#### Technical environment

- Next.js App Router
- TypeScript
- Tailwind CSS
- GitHub: AdamLoughnane/PEWSS
- Vercel project: pewss
- Cloudflare DNS
- Supabase: proposed backend; inspect current implementation before assuming its status
- Local development directory on the owner's Mac: ~/Developer/PEWSS

#### Before making changes

1. Read the README and relevant project documentation.
2. Inspect the current source code and recent Git history.
3. Check the working tree for uncommitted changes.
4. Determine the actual implementation rather than relying on historical descriptions.
5. Identify any relevant architecture decisions.
6. Preserve existing functionality and visual identity unless explicitly instructed otherwise.

#### Design principles

The website should have a sophisticated, restrained academic and editorial aesthetic.

Preserve the intercultural architectural imagery, generous spacing, prominent serif typography and established visual identity.

The permanent PEWSS institutional identity should remain distinct from the changing annual academic theme.

Do not undertake an unsolicited redesign.

#### Content principles

Use British/Irish English.

Maintain accurate academic terminology, scholars' names and diacritics.

Do not invent faculty participation, application deadlines, fees, credit arrangements or programme details.

Distinguish confirmed information from provisional information.

#### Development principles

Prefer small, maintainable changes.

Avoid unnecessary dependencies, architectural complexity and recurring infrastructure costs.

Do not replace existing infrastructure without explaining the rationale and obtaining approval.

Never expose credentials, private applicant information or server-side API keys.

Do not modify production DNS, database schemas, billing arrangements or authentication infrastructure without explicit authorisation.

#### Deployment

GitHub is the authoritative source repository.

Vercel automatically deploys changes to the main branch.

The canonical public domain is pewss.org. The www subdomain redirects to it.

Test changes locally before deployment. Use preview deployments for substantial changes where appropriate.

#### Documentation

Update relevant documentation when making significant changes.

Record architectural decisions, completed tasks, unresolved issues and any assumptions.

Project knowledge should remain in the repository rather than exclusively in AI conversation histories.

The project must remain maintainable by different AI assistants and human developers.

### End-of-session protocol

Record what changed, affected files, rationale, tests, commit/deployment status, new dependencies or environment variables, outstanding problems and next action. Write substantial session updates into status documentation or changelog.

## 16. Ready-to-use prompt for another chatbot

> I am developing PEWSS, the Phenomenology East and West Summer School, an annual international graduate-level philosophy summer school hosted at University College Cork, Ireland.
>
> The website is https://pewss.org.
>
> The inaugural summer school takes place on 26–29 May 2027. Its revised theme is (Non-)Self and Space. The original theme, Space and Technē, has been superseded.
>
> The website already exists and has been deployed. We are continuing an existing project, not creating a new website.
>
> The technical stack is Next.js, TypeScript and Tailwind CSS, with GitHub source control, Vercel hosting and Cloudflare DNS. Supabase was selected as the preferred future backend, but its current implementation status needs to be established from the code.
>
> The repository is https://github.com/AdamLoughnane/PEWSS.
>
> On my Mac, the local project is located at ~/Developer/PEWSS.
>
> The Vercel project is called pewss and is located within my existing Samedif's projects workspace.
>
> The canonical domain is pewss.org, with www.pewss.org configured to redirect permanently to it.
>
> I am establishing a chatbot-agnostic development workflow. All important project knowledge, technical decisions, implementation status and development instructions should be maintained in the GitHub repository rather than exclusively in chatbot conversation histories.
>
> Before making any changes, please:
>
> 1. Read the existing project documentation.
> 2. Inspect the repository and recent Git history.
> 3. Establish the current website architecture, implemented routes, application workflow, dependencies and environment variable requirements.
> 4. Identify discrepancies between historical documentation and the current implementation.
> 5. Report the current state of the project, including outstanding issues.
> 6. Preserve the existing design and functionality unless I explicitly request changes.
>
> Do not rebuild the website from scratch, replace the existing infrastructure or make unsolicited design changes.
>
> I will provide a historical handover report containing the original development decisions and project context. Treat this as background documentation, and treat the current repository as the authoritative source for implementation details.
>
> At the end of each development session, update the relevant project documentation so that another AI assistant or human developer can continue seamlessly.

## 17. Disaster recovery and reconstruction

| Resource | Recovery purpose |
|---|---|
| GitHub repository | Source and history |
| Domain registration | Ownership |
| Cloudflare | DNS |
| Vercel | Deployment |
| Environment variables | Integrations and backend access |
| Database backups | Application and participant records, if applicable |
| Storage backups | Uploaded documents and assets, if applicable |
| Original design assets | Visual identity |
| Email hosting account | Correspondence, once established |
| Documentation | Context and decisions |

Clone repository, install dependencies, restore environment variables securely, confirm local build, import into Vercel, reconnect custom domain and restore backend/email integrations. GitHub alone cannot recover external databases, documents, email or secrets. Back these up separately if applicable.

## 18. Limitations

Historical reconstruction from available project conversations, not a direct audit of local repository, GitHub source, Vercel, Cloudflare or Supabase. Verify current Next.js version, dependencies, file structure, subsequent Codex changes, application form/submission, Supabase, environment variables, integrations, hero animation, approved copy, repository visibility, email and data protection. No invented credentials, completed functionality or approved database schema. Documentation structure, ADRs, recovery procedures and agent instructions are recommendations.

This Markdown edition preserves the substantive handover in all 19 sections, with visual components converted to text and some prose condensed for portability; it is not a verbatim transcript.

## 19. Final recommendation

Distinguish project knowledge (academic objectives, history, rationale: PROJECT_CONTEXT.md and HANDOVER.md), implementation knowledge (actual architecture, code, dependencies, deployment: repository, README and ARCHITECTURE.md), and continuity knowledge (recent work, outstanding tasks and next actions: STATUS, CHANGELOG and AGENTS).

Next step: have a coding agent with access to `~/Developer/PEWSS` conduct a full technical audit and reconcile this report with actual code. Maintain the verified handover in GitHub so ChatGPT, Claude, Codex, Gemini or human developers can resume from the same repository and documentation.

**The AI assistant becomes replaceable; the project retains its knowledge.**

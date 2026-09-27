# PEWSS project context

Initially retrieved on 27 September 2026 from the available conversation text in the ChatGPT project **SUMMER SCHOOL**, and checked against the local homepage. Expanded on the same date with the user's two supplied scope documents and accelerated development plan. This is a working project brief, not a complete transcript or a transfer of the ChatGPT project. Planned features, optional ideas, and confirmed implementation are distinguished below.

## Sources and retrieval limits

- [WEBSITE](https://chatgpt.com/c/6ab8c1c0-7244-83ed-bdaf-b1b074932ee6): five recent exchanges returned, covering typography and the move to the local Codex workspace.
- [Brainstorm Visual Concepts](https://chatgpt.com/c/6ab725a5-8e80-83ed-bbcc-85a1684c9464): five recent exchanges returned, covering editable poster artwork and production packages.
- [Summer School Blurb Draft](https://chatgpt.com/c/6ab45458-1bdc-83eb-aec9-b1d6736891cc): three exchanges returned, covering the brief, draft copy, and possible alternative theme titles.

The retrieval tool exposed no further pages for these results. Project-level ChatGPT instructions, earlier exchanges not returned by the tool, and the actual generated image/ZIP/PPTX/PDF/SVG files were not imported. References to those files in the chats do not establish that the files are available locally.

The user subsequently supplied the following as the most important statement of the full project scope:

- **Full platform scope**, beginning “Yes. Given what you’re building…”: `/Users/adamloughnane/.codex/attachments/7de1d77a-deae-4349-a5a3-4b6ef23c52d0/Pasted text.txt`.
- **Profiles and platform work plan**, beginning “Absolutely. I would add profiles…”: `/Users/adamloughnane/.codex/attachments/cc9d3526-b572-4926-bf10-7efb36bb7fa7/Pasted text.txt`.
- **Accelerated Version 1 plan**, pasted directly into this Codex conversation, prioritizing the public website and a working application form, followed by incremental platform development.

Their substantive scope is recorded below so future work does not depend on access to the attachments or the original chats.

## Current delivery priority and status

**Build a strong Version 1 in weeks, get applications flowing, and add the participant/faculty platform afterward without rebuilding the public site.** The accelerated plan supersedes the original sequence that put accounts and profiles before opening applications. The full platform remains the longer-term scope; its features are not all prerequisites for launch.

The user reports that getting the initial website up and running is **done**. This does not establish that the full V1 homepage, application processing, or later platform features are complete. During the initial context import, only the local homepage and package configuration were inspected; form submissions, email delivery, deployment, and other routes were not verified.

The immediate scope is **the public website plus a functional application form**, with no applicant accounts required. Structure the content and stored applications so later editions, accounts, reusable profiles, and academic workflows can be added incrementally. Do not restart the completed site setup merely because the original work plan starts there.

## Version 1: public launch site

The homepage should communicate a distinctive academic identity, with the encounter between European phenomenology and East Asian philosophical traditions central to the project. The intended section order is:

1. **Hero:** “PHENOMENOLOGY EAST AND WEST”; “Summer School 2027: SPACE AND TECHNĒ”; “26–29 May 2027 · University College Cork, Ireland”. Use an animated version of the developed visual, with **Apply Now** and **Learn More** actions. Keep the experience fast and usable on phones.
2. **The central question:** “How do the spaces we inhabit shape our experience—and how are those spaces transformed by technology?” Follow with the short introduction explaining the European phenomenology / East Asian traditions encounter.
3. **What the Summer School is:** show the daily format prominently: **Morning seminars · Afternoon workshops · Evening plenary keynotes · Site visits & movement sessions**. Highlight international specialists, small-group teaching, the MA/PhD/ECR/practitioner audience, and graduate ECTS credit.
4. **2027: Space and Technē:** give a fuller intellectual account of the theme, including the philosophical meanings of space and technē and the East–West approach.
5. **Faculty:** photographs, names, affiliations, and short biographies of approximately two or three lines. Homepage cards are sufficient initially; fuller linked profiles can follow.
6. **Programme / What to expect:** show a sample daily rhythm while the final timetable is unavailable, clearly labelled **Full programme forthcoming**.
7. **Essay Competition:** give prominent treatment to the planned selection of the best student essay for publication in the *Journal of Aesthetics and Phenomenology*, with the basic eligibility and competition details that are known.
8. **ECTS / Who can apply:** address MA students, PhD students, early-career researchers, and practitioners; explain the graduate-credit opportunity and known requirements.
9. **Cork / UCC:** establish place and atmosphere in a compact section. A full travel guide can follow later.
10. **Final application call:** “Join us in Cork, 26–29 May 2027”, with **Apply to PEWSS 2027**.

The footer should contain PEWSS identity, appropriate UCC affiliation, contact information, privacy information, and mailing-list signup/social links when available.

The accelerated plan identifies a section-by-section homepage specification as the next design deliverable: finished copy, visual treatment, buttons/navigation, and placement of the animated artwork, ready to implement in the existing site. **pewss.org** is the intended permanent institutional domain; its registration and configuration were not checked during this documentation update.

## Version 1: application flow

**Apply** leads to `/apply`. Provide a well-designed form without requiring an account. Store each submission as a manageable application record, with a confirmation page and a confirmation email to the applicant. Organizers need a manageable way to receive and review records; the full admissions dashboard is a later feature.

The proposed initial fields are:

- Name, email, institution, programme/career stage, and country.
- Research interests, short biography, and statement of interest/application statement.
- Optional website and ORCID.
- Profile photograph, collected with appropriate consent for the planned profile system.
- Whether the applicant wants ECTS credit.
- Consent/privacy acknowledgement.
- Accessibility and dietary needs may be collected now or deferred until acceptance; the timing for this sensitive practical information remains to be decided.

Store information so accepted applicants can later move into the account/profile system without unnecessary re-entry or asking for photographs again. Collecting a photograph is not permission to publish it in a directory: profile visibility and directory participation require their own appropriate consent choices.

The original 1–3 week launch estimate, dependent on copy, faculty information, and imagery, was:

| Stage | Indicative work |
| --- | --- |
| Days 1–2 | Site architecture, technical setup, domain, hosting; initial site setup is now reported done. |
| Days 2–4 | Homepage design and responsive layout. |
| Days 4–6 | Write/refine homepage copy and populate imagery. |
| Days 5–7 | Application form, submission storage, confirmation. |
| Week 2 | Faculty content, theme/programme sections, mobile polish, privacy, accessibility, and testing. |
| Then | Launch recruitment with a working public site and applications. |

This is an indicative sequence, not a newly scheduled deadline. Accounts, participant/faculty portals, paper uploads, feedback, personalized schedules, ECTS tracking, essay-prize judging, and alumni features belong **after launch**.

## Full platform scope

PEWSS is one continuing platform serving three connected purposes: public identity, recruitment/admissions, and an academic learning environment for accepted participants. It should support a person's changing relationship with the school across years: visitor, applicant, participant, alumnus, faculty, and administrator. A returning participant or faculty member should be able to reuse their existing identity.

### Public identity, annual editions, and place

The longer-term site map includes **Home, About PEWSS, 2027: Space and Technē, Faculty, Programme, Apply, ECTS / Graduate Credit, Essay Prize, Coming to Cork, Past Summer Schools, News / Updates, and Contact**. Edition-specific content should fit under a structure such as `/2027/...`; PEWSS remains the permanent identity, with 2027 the inaugural edition. A future top-level organization can be **About · People · Summer Schools · Apply**.

Each edition should eventually preserve its theme, faculty, programme, photographs, selected recordings/resources, essay-prize winner, and testimonials/highlights. Subsequent editions reuse the infrastructure. Archive public material appropriately; private profiles, applications, and papers follow the agreed retention policy.

The expanded **Coming to Cork** material should cover UCC, accommodation, travel from Cork Airport and Dublin, maps, food, accessibility, and visitor recommendations. Architecture, movement, spatial experience, and site visits also make Cork part of the intellectual identity of the school.

A permanent **PEWSS Essay Prize** page should explain eligibility, judging, rules, and the publication opportunity, then record each year's winner, institution, essay title, and eventual publication link. Add basic analytics for recruitment sources and applicant institution/country patterns, and a mailing list for future editions such as “Hear about PEWSS 2028”.

### Reusable people, profiles, and permissions

**Person/Profile is a core data object.** Store each person's photograph and basic profile once, then reuse them in faculty pages, programme entries, workshop groups, participant directories, paper assignments, feedback, and alumni records. Support role-based permissions, including a person returning in a different role in a later year.

Student/participant profile fields proposed in the scope are: photograph, name, preferred name, optional pronouns, institution, department, country/location, MA/PhD/ECR/practitioner stage, research interests, short biography, personal/academic website, optional ORCID, and research/project description. Keep private administrative fields distinct from information shared with participants. Directory membership is opt-in.

Faculty profiles should include photograph, name, title, institution, biography, research interests, website, selected publications, and the sessions/workshops they lead. A participant's dashboard can show their assigned faculty reader's photograph and profile beside feedback; faculty can see the relevant student's photograph and profile beside assigned work.

Build community through a lightweight private participant directory and cohort page, rather than a full social network. The cohort page may remain available after the school, subject to consent and retention decisions. Alumni profiles are a possible later extension.

### Admissions and communication

After V1, applicants should be able to create an account/profile, save a draft application, return, and submit. The fuller admissions state model is:

**Draft → Submitted → Under Review → Accepted / Waitlisted / Declined → Offer Accepted → Registered**.

Administrators review records and record decisions in an application-management dashboard. Acceptance and registration should grant the appropriate participant access on the existing account. Notifications can cover submission confirmations, acceptance/waitlist decisions, approaching deadlines, paper-upload reminders, and programme updates.

### Participant and faculty portals

The participant dashboard should bring together profile, edition, programme, personal sessions/schedule, workshop group, faculty, participants, readings, paper submission, ECTS progress, Essay Prize, and practical information. A faculty dashboard should show sessions, students/groups, assigned papers, readings/resources, and feedback tasks.

A Summer School library should support faculty-provided PDFs, bibliographies, seminar questions, and optional readings, with access restricted to the appropriate year's participants. Keep practical and academic information readily accessible without relying on participants searching old email threads.

### Programme and event companion

Represent sessions as structured data: **time, location, type, title, description, faculty, and participants/group**. Session types include lectures, seminars, workshops, plenary keynotes, movement sessions, and site visits. Generate the public programme and personal schedules from the same data, with linked faculty profiles and photographs.

Later enhancements include `.ics` calendar export and a mobile schedule. During **26–29 May 2027**, the public homepage can foreground **Today at PEWSS**, while authenticated users see **My Day**, locations, readings, announcements, faculty, and workshop participants. The mobile website should serve as the event companion without requiring a separate conference app.

### Papers, faculty feedback, and ECTS

Support **paper → faculty feedback → student response → revised paper**, retaining a clear version history rather than overwriting files. Faculty should see assigned papers unless explicitly given broader permissions; students should see their own work and feedback.

Initial feedback can consist of written comments, an uploaded annotated PDF/Word document, assessment/status, and a revision request. Inline annotations are optional later work. Show the assigned reader and profile alongside the submission.

ECTS has its own workflow, beginning with the applicant's credit preference and covering registration, attendance/required sessions, participation/workshops, paper submission, faculty assessment, and completion of requirements. Administrators should be able to generate the appropriate completion record/certificate, including documentation students can take back to their home institutions. Exact credit and assessment requirements still need to be supplied.

### Essay-prize administration

Keep ordinary coursework/ECTS submission separate from entering the **PEWSS Essay Prize**. Students explicitly choose to enter a paper and agree to competition terms. Administrators/judges see eligible entries separately; anonymized judging copies are an optional feature depending on the chosen judging procedure. Publish the winner in the permanent public prize archive and link the eventual *Journal of Aesthetics and Phenomenology* publication.

### Platform foundations and operational readiness

The supplied scope calls for privacy/GDPR documentation, consent, retention rules, role-based permissions, secure file storage, backups, and accessibility from the outset, scaled to the features actually being introduced. These are project requirements; this note does not establish legal compliance or resolve specific institutional policies.

Before the event, verify account creation and password recovery, mobile use, permissions, uploads/downloads, faculty access, student privacy, application records, programme accuracy, email delivery, accessibility, backups, privacy handling, and failure/error states. Populate final faculty/participant information, rooms, readings, maps, programme changes, and practical information. The original readiness target is to stop major feature development and have the platform effectively finished about two weeks before **26 May 2027**.

## Data model and technical direction

The planned shared model includes **People / profiles / photos; roles; applications; annual Summer Schools; sessions; groups; resources/readings; submissions and versions; faculty assignments; feedback and responses; ECTS records; essay-prize entries; and messages/notifications**. People, annual editions, sessions, and academic records should connect across the system rather than being duplicated independently for each screen.

The original proposed stack was **Next.js + Supabase + Vercel**, subject to requirements review. Next.js is present locally, and the historical WEBSITE chat reports Vercel deployment. **Supabase remains a proposal, not a verified installation or a finalized backend decision.** The original foundation plan also mentioned securing `pewss.org` and possibly `pewss.ie`, defining user journeys, data/permission models, wireframes, and a visual system based on the poster's wordmark, typography, colours, and imagery.

## Original platform roadmap, retained for context

The attachment proposed the following longer programme. Its feature coverage remains relevant, but its accounts-before-applications sequence and extensive pre-build planning are superseded by the accelerated V1 approach above. These dates are historical planning targets, not confirmation of completed work or freshly agreed deadlines.

| Original phase | Original target | Scope |
| --- | --- | --- |
| 1. Foundation/specification | Now–early October 2026 | Domain, visual identity, site map/journeys, data model, stack, roles, privacy/retention. |
| 2. Public website | October 2026 | Permanent institutional site, annual-edition structure, animated hero, mobile usability. |
| 3. Accounts/profiles | October–November 2026 | Authentication and reusable student/faculty profiles. |
| 4. Applications | November–December 2026 | Saved drafts, admissions dashboard, decisions, notifications, participant access. |
| 5. Portals | January–February 2027 | Participant/faculty dashboards, private directory, resources. |
| 6. Programme/scheduling | February–March 2027 | Structured sessions, interactive programme, personal schedules. |
| 7. Papers/feedback/ECTS | March–April 2027 | Versions, assignments, responses, assessment, credit records/certificates. |
| 8. Essay Prize | April 2027 | Separate entry, terms, judging, permanent winner record. |
| 9. Final preparation | April–mid-May 2027 | Final content and testing; avoid major features near the event. |
| 10. During PEWSS | 26–29 May 2027 | Today at PEWSS / My Day, mobile schedule and event information. |
| 11. After PEWSS | After the event | Public archive, retention handling, subsequent editions, possible alumni profiles. |

## Identity and programme

- Recurring school: **Phenomenology East and West Summer School** (PEWSS).
- Current website theme: **Space and Technē**.
- Dates in the draft copy and local homepage: **26–29 May 2027**.
- Location in the local homepage: **University College Cork, Ireland**.
- Central question: how the spaces we inhabit shape experience, and how technology transforms those spaces.
- East–West encounter: European phenomenology in conversation with East Asian philosophical traditions.
- Intended audience in the draft: graduate students, early-career researchers, and practitioners, including artists, architects, and performers.

The user's blurb brief requests graduate credit, an essay competition, world-leading international specialists, and close learning in small workshop groups. Topics include space, technology, architecture, movement, perception, how technology binds or frees us, AI, robotics, and automation. Approaches span philosophy, arts, performance, architecture, dance, movement studies, digital humanities, and spatial humanities.

The assistant's draft also describes student presentations on the opening day, embodied/site-based inquiry, and publication of the winning essay in the *Journal of Aesthetics and Phenomenology*. The subsequently supplied scope includes the essay-prize publication opportunity and embodied/site-based activities as planned features. Institutional arrangements and detailed eligibility/credit requirements have not been independently verified; the opening-day presentation detail comes from the earlier draft.

## Website and typography

The WEBSITE chat describes an existing local repository at `/Users/adamloughnane/Developer/PEWSS`, a GitHub repository named `AdamLoughnane/PEWSS`, and Vercel deployment. The remote/deployment state was not verified during this context import.

The user wanted **Phenomenology East and West Summer School** to be more prominent and then asked to reduce **Space and Technē**. The current local `app/page.tsx` already contains the size changes suggested in that discussion:

- School name in the hero: `text-2xl md:text-3xl lg:text-4xl`.
- Theme heading: `text-5xl md:text-7xl lg:text-8xl`, serif, with a break between “Space and” and “Technē”.

The current page uses `/pewss-hero.jpg` as a full-screen hero background, white overlaid typography, a dark overlay, and a warm off-white About section. Navigation includes About, 2027, Faculty, Programme, and Apply. The existence or completeness of the linked destinations was not checked during this import.

Local package versions at import: Next.js 16.3.6, React 19.2.8, and Tailwind CSS 4. Read the installed Next.js guides before code changes, as required by AGENTS.md.

## Visual direction and poster work

The user requested a clean, editable layered reconstruction using the original generated **#3 image**, with typography and graphic elements recreated separately. The subsequent production-package descriptions preserve Japanese architecture on the left, a central figure, and Greek/classical architecture on the right.

The user questioned PowerPoint as the production format and accepted preparation of a Photopea-oriented package. The chat reports a starter SVG master with separate artwork, text, panels, rules, and graphic elements, intended to be opened in Photopea and saved as PSD. The proposed print specification is A2 portrait, 420 × 594 mm, with 3 mm bleed. A generated UCC crest was treated as a placeholder to replace with official artwork.

Reported artifact names include `PEW_2027_Photopea_package.zip`, `PEW_2027_Photopea_starter_master.svg`, `FINAL_COPY.txt`, and `PEW_2027_production_package.zip`. These artifacts have not been downloaded or inspected here.

## Open design question

The user observed that “Space and Technē” leans too much toward Greece and asked for a better East–West balance. The assistant proposed options including “Making Space: Technē, Waza, and Technologies of Inhabiting”, “Making Space: Technology, Movement, and the Art of Inhabiting”, “Ways of Inhabiting: Space, Technology, Movement”, and “Space, Technē, Waza: Technology and the Art of Inhabiting”. No replacement title was selected in the retrieved messages. The local website continues to use **Space and Technē**.

## State at import

The working tree already contained modifications to `app/page.tsx` and an untracked `public/pewss-hero.jpg`. This context import preserves both. It adds this note only; historical requests recorded here are background for future work, not a new instruction to change or publish the site.

The subsequent scope update modifies only this document. It records the user's adopted project scope and launch priorities for future work; it does not implement or mark any additional website/platform features complete.

## Homepage implementation update — 27 September 2026

**Current design preference:** keep the complete fuller homepage, its fonts, sections, colours, mobile menu, and stationary-hero scroll effect. Left-align only the text and buttons over the hero image, including the title, theme, dates, and location. A temporary rollback misunderstood the user's request and has been undone; the simple original hero/About layout is not the current design.

The original centred version of the fuller draft is backed up at `/Users/adamloughnane/.codex/visualizations/2026/09/27/01a0e334-7501-7bd3-a19d-d4176dad9d9c/pewss-full-homepage-draft.zip`.

The user supplied `ChatGPT Image 27 Sept 2026, 15_24_08.png` as the fuller homepage reference and requested a stationary hero with content panels scrolling in front of it. The local homepage implements this direction with a left-aligned institutional title and smaller annual theme over the original hero artwork, ivory/stone content panels, and dark green programme/application sections with muted gold actions.

The implemented sections cover the central question, four teaching formats, expanded theme, key benefits/audience, indicative programme, essay prize, forthcoming faculty, UCC/Cork, participation/ECTS questions, and a final application call. Expandable details and a mobile menu work locally. The hero uses CSS sticky positioning beneath the content; reduced-motion preferences and short viewports receive normal-flow scrolling. There is no separate animated hero video yet.

`/apply` now provides an honest “Applications opening soon” information page so application links do not lead to a missing route. The submission form, storage, confirmation email, and admissions workflow remain to be implemented. Faculty names, programme timetable, fees, exact ECTS requirements, and competition rules remain forthcoming. Contact details, privacy documentation, and mailing-list integration still need to be supplied/completed before recruitment launch.

The UCC campus photograph at `public/ucc-campus.webp` is sourced from [UCC's visitor page](https://www.ucc.ie/en/discover/visit/), with visible attribution. Original image URL: `https://www.ucc.ie/en/media/discoverucc/visitucc/VisitUCC.webp`. The reference mock-up's Cork image was not used as a documentary photograph.

The implementation remains local; nothing was committed, pushed, or deployed as part of this draft. Lint and TypeScript checks passed. The production build passed with `npm run build -- --webpack`; the default Turbopack build encountered an environment restriction when binding its local CSS-worker port.

The shared header now has a **Login** button beside **Apply**, including on mobile. It leads to `/login`, a placeholder with separate **Student login** and **Faculty login** options, both disabled and labelled “Coming soon”. No authentication, accounts, credential collection, or portal access is implemented yet. This is a visible entry point for the later student/faculty platform.

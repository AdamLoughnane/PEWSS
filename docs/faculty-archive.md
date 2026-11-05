# Faculty page archive

Archived on 5 November 2026 at the user's request. Wait until at least two more invitees have confirmed and the user asks to publish the profiles again. Do not automatically restore them as part of other website work.

The public `/faculty` page and homepage faculty teaser have returned to their pre-profile wording, “Faculty announcements coming soon”. Portrait files have also been removed from the current public assets.

## Saved version

- Git commit: `77d09b8` — includes all six portraits, biographies, academic links, credits, responsive layout, and the “More faculty announcements coming soon. Check back for updates.” note.
- Local archive branch: `codex/archive-faculty-profiles`, pointing to that commit. It is not pushed as a separate preview site.
- The commit is also retained in `main` history on GitHub. The rollback adds a new commit; it does not rewrite history.
- Local ZIP: `output/archives/PEWSS-faculty-profiles-2026-11-05.zip`.

The ZIP contains `app/faculty/`, all six images in `public/faculty/`, `docs/faculty-sources.md`, and a snapshot of `app/page.tsx`. It is stored outside `public/` and does not create an archive page on the website. Historical deployment snapshots are not deleted by this rollback.

## Restore when authorised

Restore the faculty-specific files from the saved commit:

```sh
git restore --source=77d09b8 -- app/faculty public/faculty docs/faculty-sources.md
```

Then update the homepage's faculty teaser only, using the saved `app/page.tsx` as a reference. Do not replace the entire homepage or switch the production branch to the archived commit: later website improvements must be preserved. Add newly confirmed faculty and update the project context before publishing. Run lint and a production build, inspect desktop/mobile presentation, then deploy and check the live page.

The ZIP offers an additional copy if the local archive branch is unavailable. Its full homepage snapshot is a reference, not a file to overwrite blindly.

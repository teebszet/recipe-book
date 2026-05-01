## Context

The app's current public name is "Recipe Book", a placeholder set when the project was scaffolded. The user wants to ship under **food le pop**. This is a copy change with no behavioural impact.

## Goals / Non-Goals

**Goals:**
- Replace user-visible "Recipe Book" with "food le pop" in the header wordmark, the HTML page title, and the metadata description.
- Update the README headline so anyone landing on the repo sees the current product name.
- Pin the canonical name in a spec requirement (`app-branding`) so future edits can't silently drift it.

**Non-Goals:**
- Renaming the npm package (`package.json#name`) — internal-only, not worth the lock-file churn.
- Renaming the git repository or the deployed Fly app — separate ops concerns; the user can do these out-of-band.
- New favicon/logo artwork — text wordmark only for now; design pass deferred.
- Any non-cosmetic behaviour change.

## Decisions

**Decision 1: Capitalisation = "food le pop" (lowercase, with spaces).**
The brand string is treated as a literal — never auto-title-cased. The `app-branding` requirement pins the exact string so a future contributor can't "fix" it to "Food Le Pop".

**Decision 2: Single source for the name string.**
Rather than scatter the literal across `layout.tsx`, `Header.tsx`, and other future surfaces, define a single constant — e.g. `APP_NAME` exported from `src/lib/branding.ts` — and import it everywhere. Keeps drift impossible at the code level too. README stays a hard-coded string (markdown).
*Alternative considered:* hard-code the string in each of the two current call sites. Rejected because we're explicitly trying to prevent drift, and any future surface (emails, share metadata, OG tags) should pull from the same constant.

**Decision 3: No data migration.**
The name lives only in UI strings and metadata. No DB rows reference the old name. Nothing to migrate.

## Risks / Trade-offs

- **[Risk] External references to "Recipe Book" outside the repo (browser bookmarks, deploy logs, Fly app name) won't update.** → Mitigation: out of scope; user handles separately if they want.
- **[Risk] OG/social share metadata may still cache the old name in third-party crawlers (Slack, Twitter, iMessage previews).** → Mitigation: minor, self-heals on next crawl; no action needed.
- **[Trade-off] Adding a `branding.ts` constant for two call sites is mild over-engineering today, but the `app-branding` requirement explicitly forbids drift, so the indirection earns its keep on the next surface that needs the name.**

## Migration Plan

1. Land the change behind no flag — pure copy update.
2. Deploy normally; next page load shows the new name.
3. Rollback = revert commit. No data implications.

## Open Questions

None.

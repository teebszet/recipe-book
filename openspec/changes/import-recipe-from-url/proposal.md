## Why

Adding a recipe today requires a contributor to manually type title, ingredients, instructions, tags, and upload photos. The user reports this as the dominant friction in growing the recipe library — there aren't enough recipes for the app to be useful yet, and most recipes already arrive as a shared link (recipe website URL or Instagram post). Eliminating manual transcription is the highest-leverage UX improvement available.

This change introduces an "Import from URL" flow that pre-fills the recipe form from a pasted link.

## What Changes

- New "Import from URL" entry point on the create-recipe page (`/recipes/new`). Contributor pastes a URL, server fetches and parses it, the recipe form is pre-filled, contributor reviews and saves.
- Server-side URL fetcher with safety controls (SSRF protection, response-size cap, timeout, content-type check).
- **Phase 1 — Generic recipe URLs**: parse `schema.org/Recipe` JSON-LD. Map `name`/`recipeIngredient`/`recipeInstructions`/`image`/`description`/`recipeCategory`/`keywords` to our schema. Download the first image into our upload pipeline as a `Photo`.
- **Phase 1 fallback**: if no JSON-LD, scrape Open Graph `title`/`image`/`description` and dump description into the form's description field, leaving ingredients/instructions empty for the contributor to fill.
- **Phase 2 — Instagram URLs (research-gated)**: a research spike runs first against `@kenzoeats` toddler recipes. Outcomes drive whether we ship IG support in this change or punt to a follow-up. Working assumption: caption-only parsing + thumbnail extraction; **video transcription is out of scope** (disproportionate infra for a side feature).
- All import endpoints require contributor authentication (same gate as create/edit).
- The imported recipe is **never auto-saved** — it always lands in the existing form for human review before persisting.

## Capabilities

### New Capabilities
- `recipe-import`: Server-side ingestion of recipe data from a remote URL. Covers fetching, parsing strategies (JSON-LD first, OG fallback, Instagram-specific), photo download, mapping to our recipe schema, error handling, and the safety envelope around server-side HTTP fetches.

### Modified Capabilities
- `recipe-management`: Add an "Import recipe from URL" entry point requirement on the create-recipe surface. The existing "Create a recipe" requirement is unchanged — the import flow ends by handing off to that surface.

## Impact

- **Code**:
  - New: `src/lib/import/fetch.ts` (safe server fetch helper), `src/lib/import/jsonld.ts` (JSON-LD parser), `src/lib/import/og.ts` (OG fallback), `src/lib/import/instagram.ts` (phase 2, conditional), `src/lib/import/index.ts` (orchestrator).
  - New: `src/app/api/import/route.ts` — POST endpoint that takes `{ url }` and returns parsed recipe + downloaded photo IDs.
  - Modified: `src/app/recipes/new/page.tsx` — add the Import from URL UI block above the existing form.
  - Modified: `src/components/RecipeForm.tsx` — accept `initialData` from the import response (already supports `initialData`; verify shape compatibility).
  - Reused: `src/lib/ingredients.ts` (parsing free-text ingredients into structured form), `src/lib/upload.ts` (photo storage + validation), `src/lib/auth.ts` (auth gate).
- **APIs**: new `POST /api/import` (auth-required). No change to existing recipe APIs.
- **Schema / data**: none. Imported recipes use the existing `Recipe` / `Photo` / `Tag` models as-is.
- **Dependencies**: likely add a small JSON-LD/HTML parsing helper (`linkedom` or `cheerio` for HTML; `schema-dts` types optional). Decision deferred to design.md.
- **Deployment**: server-side outbound HTTP needs to be allowed from the Fly app (it already is for image fetching during normal operations — re-confirm). No new env vars expected unless Phase 2 forces an Instagram API key.
- **Performance / cost**: each import is a single outbound HTTP request plus image download. Bounded by SSRF/size/timeout limits in the safe-fetch helper.
- **Risk surface**: new outbound network code path is a classic SSRF vector — explicitly mitigated in design.md.

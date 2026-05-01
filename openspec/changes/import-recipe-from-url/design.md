## Context

Most recipe websites today (NYT Cooking, Serious Eats, BBC Good Food, AllRecipes, food blogs on WordPress, etc.) publish their recipes as `schema.org/Recipe` JSON-LD embedded in `<script type="application/ld+json">`. This is the de-facto interop format — Google requires it for the rich-results recipe card, so adoption is near-universal in the food-blog space. Building Phase 1 on JSON-LD is the highest-leverage starting point. Test case for Phase 1 POC: `https://mykoreankitchen.com/kimchi-jjigae/#recipe`.

Instagram is harder. The platform doesn't publish open structured data; oEmbed exists but increasingly requires an app token, and unauthenticated HTML scraping yields varying results depending on whether IG decides you look like a bot. Video transcription (e.g., Whisper) would extract the most signal from reels but is operationally heavy: download a video, push it through ASR, parse the transcript — all for a feature that's secondary to the generic-URL case.

The current recipe form (`RecipeForm.tsx`) already supports an `initialData` prop. The import flow can hand off cleanly: server parses → returns `initialData`-shaped JSON → form mounts pre-filled.

## Goals / Non-Goals

**Goals:**
- Cut the time-to-add-recipe for contributor from "manual transcription" (multiple minutes) to "paste link, review, save" (under 30 seconds for clean JSON-LD sources).
- Phase 1 reliability target: any recipe site that publishes valid `schema.org/Recipe` JSON-LD imports cleanly. Empirical baseline: 3 fixture sites must round-trip with no manual edits beyond contributor review.
- Make server-side URL fetching safe (SSRF, size, timeout, content-type) — pattern that any future server-fetch use can reuse.
- Phase 2 produces a yes/no decision on Instagram. If yes, ship caption parsing + thumbnail. If no, punt to a follow-up change with documented rationale.
- Keep the contributor in control: imported data always lands in the form for review before save.

**Non-Goals:**
- Auto-saving imported recipes. Always human-reviewed.
- Video transcription / ASR for Instagram reels. Caption-only.
- Headless-browser scraping (Puppeteer/Playwright). Too much infra weight for a side feature on a Fly micro VM.
- Recipe deduplication. If the same URL is imported twice it creates two recipes; existing UX has no concept of "this recipe already exists" and adding it is out of scope.
- Bookmarklet / browser extension / share-sheet integration. Web-only paste-the-URL flow for now.
- Authenticated Instagram via Meta Graph API. Requires app review and adds infra; revisit only if Phase 2 spike concludes nothing else works.

## Decisions

**Decision 1: JSON-LD first, OG fallback, no HTML-scraping pipeline.**
Phase 1 parses `<script type="application/ld+json">` blocks, finds the `@type: Recipe` (or array containing one), and maps fields. If no JSON-LD `Recipe` is found, fall back to Open Graph: pull `og:title` → title, `og:image` → first photo, `og:description` → form description. Ingredients/instructions stay empty for the contributor to fill manually.
*Alternative considered:* writing per-site HTML scrapers. Rejected — long tail of sites, fragile to layout changes, large maintenance burden for marginal coverage gain.

**Decision 2: Single safe-fetch helper, used everywhere.**
All outbound HTTP from the import flow goes through `src/lib/import/fetch.ts`. Responsibilities:
- Reject non-`http`/`https` schemes.
- Resolve hostname → IP and reject if IP is in any private/loopback/link-local range (SSRF mitigation). Re-resolve and re-check on each redirect to defeat DNS rebinding.
- Cap response size (HTML: 2 MB; image: 10 MB — same as existing photo-upload limit).
- Hard timeout (15s for HTML, 30s for image download).
- Allowlist of expected `Content-Type` per call site (`text/html` for the page fetch, `image/*` for photo download).
- Bounded redirects (max 3).

**Decision 3: HTML parsing — use `linkedom`.**
Lightweight, runs server-side without a browser, has a DOM API close enough to standard for `querySelectorAll('script[type="application/ld+json"]')` and basic `meta[property="og:*"]` lookups. ~200KB. Avoids `cheerio`'s jQuery-style API which we wouldn't otherwise need; avoids pulling in `jsdom` (heavy).
*Alternative considered:* regex-based extraction. Rejected — JSON-LD blocks contain nested JSON that can include strings with `</script>`-looking content, and OG meta tags appear in many slight variants. DOM parser is the right call.

**Decision 4: Ingredient parsing — reuse `src/lib/ingredients.ts`, accept lossy mapping.**
JSON-LD `recipeIngredient` is an array of strings like `"200g grated parmesan, room temperature"`. Run each through the existing parser; on failure, store the whole string as `name` with empty quantity/unit/notes. Contributor can edit before saving.

**Decision 5: Image download in-band.**
When JSON-LD `image` resolves, download the first image (or first if array) via the safe-fetch helper, run it through the existing photo-upload validation pipeline (magic-byte check, size cap, UUID rename), and create a `Photo` row linked to a draft recipe ID — *no* — actually: return the file bytes / temp file in the import response and let the form upload it on save. Simpler: import endpoint downloads the image, persists it via the same path the upload endpoint uses, and returns the photo URL+id. The form then renders it as an existing photo. If the contributor cancels, we have an orphan photo — accept that; cleanup is a future concern.
*Alternative considered:* return the image URL only and have the client refetch via the photo-upload endpoint. Rejected — doubles network traffic and forces the client to handle an outbound CORS-prone fetch.

**Decision 6: Phase 2 starts with a research spike, not implementation.**
First task in Phase 2 is a non-code spike: try `https://www.instagram.com/api/v1/oembed/?url=...`, public-page HTML scraping, and `?__a=1` JSON endpoints against five `@kenzoeats` toddler-recipe URLs. Document hit rate, what fields come back, and whether it works without auth in `discussion.md`. Decision tree:
- All three work reliably without auth → ship oEmbed-or-scrape with caption parsing + thumbnail.
- Only some posts work → ship for the working subset, fail gracefully on the rest with a clear "this Instagram post can't be auto-imported" error.
- None work without Meta credentials → punt Phase 2 to a follow-up change documented in `discussion.md`. Phase 1 ships standalone.
This avoids burning a week building a Meta Graph API integration before knowing whether the cheaper paths suffice.

**Decision 7: Caption parsing strategy (Phase 2).**
Recipe captions vary wildly. Don't try to be clever. Heuristics:
- First non-empty line → title.
- Look for an "ingredients:" header (case-insensitive); the lines following it (until blank line or "instructions:"/"method:" header) become candidate ingredient strings, each through the existing ingredient parser.
- Look for "instructions:"/"method:"/"directions:" header; lines after become instruction steps.
- If no recognised structure, leave ingredients/instructions empty and put the entire caption in the description field. Contributor fills manually.

**Decision 8: Auth posture.**
The import endpoint is gated by the same shared-password auth as `POST /api/recipes`. Reader sessions never see the import UI (same gating as the Add Recipe FAB). No separate token for import.

## Risks / Trade-offs

- **[Risk: SSRF]** A bad URL points the server at internal infrastructure or a metadata endpoint. → Mitigation: safe-fetch helper rejects private IPs and re-resolves after each redirect. Plus content-type allowlist and size cap.
- **[Risk: malicious image payload]** Imported `image` URL serves a 1GB image or a polyglot file. → Mitigation: 10MB cap, magic-byte validation in existing upload pipeline, UUID rename ignores any filename trickery.
- **[Risk: JSON-LD rich but malformed]** Site publishes JSON-LD with weird nested structures or non-standard types. → Mitigation: a defensive parser — try common shapes (object, array, `@graph`), best-effort field mapping, fail soft (return what we got, leave the rest empty for human review).
- **[Risk: Instagram permanently breaks unauth scraping]** → Mitigation: Phase 2 is gated by a research spike. Worst case we punt and Phase 1 ships standalone.
- **[Risk: orphaned photos when contributor abandons import]** → Mitigation: accepted. Future cleanup: a periodic GC of `Photo` rows with no `recipeId` — out of scope for this change.
- **[Trade-off: lossy ingredient parsing]** "200g grated parmesan" parses well; "a handful of fresh basil" doesn't. → Accepted: contributor reviews and corrects in the form.
- **[Trade-off: imported photo lives on our disk forever]** → Accepted: same lifecycle as user-uploaded photos. The user can delete via existing UI.

## Migration Plan

1. Land Phase 0 (safe-fetch helper) and Phase 1 (JSON-LD + OG) behind no flag — the new UI element is the only entry point, so unused if not pasted into.
2. Verify in production against three real recipe URLs (one big-name site, one WordPress blog, one site without JSON-LD to exercise the OG fallback).
3. Run the Phase 2 research spike. Document outcome in `discussion.md`.
4. Implement Phase 2 if greenlit; otherwise close out the change with Phase 2 punted.
5. Rollback = revert the change and the new endpoint disappears. No data implications beyond any orphan photos from successful imports — which are valid photos linked to valid recipes, so nothing to clean up unless explicitly desired.

## Open Questions

- **JSON-LD library choice**: `linkedom` is the working pick. If it turns out to mis-parse JSON-LD blocks on enough real sites, fall back to a dedicated JSON-LD parser (`jsonld.js`) — but that's heavier. Defer to first implementation contact.
- **Caption parser tuning (Phase 2)**: the heuristics above are a starting point. Tune against `@kenzoeats` fixtures before locking the rules.
- **Where to put the "Import from URL" UI**: above the form on `/recipes/new`, or as a separate tab/screen? Phase 1 default is "above the form, collapsible block". Revisit if it feels cluttered when assembled.

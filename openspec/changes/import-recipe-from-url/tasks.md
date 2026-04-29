## 1. Phase 0 — Safe-fetch helper

- [x] 1.1 Add `linkedom` (HTML parsing) to dependencies; verify it builds in the existing Next.js setup with no extra config
- [x] 1.2 Implement `src/lib/import/fetch.ts` exporting `safeFetchText(url, opts)` and `safeFetchBytes(url, opts)` with: scheme check, IP allowlist (reject private/loopback/link-local), redirect cap, size cap, timeout, content-type check, DNS re-check on each redirect
- [x] 1.3 Unit tests for `safeFetch*`: rejects file://, rejects 127.0.0.1/10.x/192.168.x/169.254.x, follows public redirect, blocks redirect-to-private, truncates at size cap, aborts on timeout, rejects wrong content-type
- [x] 1.4 Run lint + jest — all green

## 2. Phase 1 — POC live fetch

- [x] 2.1 Live-fetch `https://mykoreankitchen.com/kimchi-jjigae/#recipe` from the server (Node script or quick API route) and log: HTTP status, response headers (especially `Content-Type`, any bot-detection signals like Cloudflare), and whether a `<script type="application/ld+json">` block with `@type: Recipe` is present in the body. Capture the raw HTML as `src/lib/import/__fixtures__/mykoreankitchen.html` for offline test use.
- [x] 2.2 If the fetch is blocked (bot detection, auth wall, unexpected status): record findings in `discussion.md` and decide whether to adjust the safe-fetch headers (e.g. add a browser-like `User-Agent`) or redesign the approach before proceeding.

## 3. Phase 1 — JSON-LD parser

- [x] 3.1 Implement `src/lib/import/jsonld.ts`: `extractRecipe(html: string): Recipe | null` that finds all `<script type="application/ld+json">` blocks, parses each (skipping malformed), searches each parsed value for `@type: Recipe` directly / in array / under `@graph`, returns the first match
- [x] 3.2 Implement field mapping: `name → title`, `description → description`, `recipeIngredient[] → ingredients[]` via `src/lib/ingredients.ts` parser (with whole-string-as-name fallback on parse failure), `recipeInstructions → instructions[]` (handle string, array of strings, array of `HowToStep`), `recipeCategory + keywords → tags[]` (lowercase, dedup)
- [x] 3.3 Unit tests with three real-site HTML fixtures (capture from a big-name recipe site, a WordPress food blog, and `mykoreankitchen.com`) checked into `src/lib/import/__fixtures__/`
- [x] 3.4 Unit test edge cases: malformed JSON-LD block (skipped, parser continues), `@graph` containing a Recipe, multiple JSON-LD blocks where only the second has the Recipe

## 4. Phase 1 — Open Graph fallback

- [x] 4.1 Implement `src/lib/import/og.ts`: `extractOpenGraph(html: string): { title, description, image } | null` reading `og:title`/`og:description`/`og:image` (with `<title>` fallback for title)
- [x] 4.2 Unit tests: page with all OG tags, page with only `og:title`, page with no OG/title at all (returns null)

## 5. Phase 1 — Image download

- [x] 5.1 Wire image download into the import flow: when JSON-LD `image` or `og:image` resolves, call `safeFetchBytes` with `image/*` content-type allowlist and 10MB cap
- [x] 5.2 Pass the bytes through the existing photo upload validators in `src/lib/upload.ts` (magic-byte check, UUID rename); persist a `Photo` row and return `{ id, url }` to the caller
- [x] 5.3 If image download or validation fails, the import succeeds without the photo — log a warning, return the rest of the parsed recipe, no error to the contributor
- [x] 5.4 Test: successful JPEG download, oversized image rejected, magic-byte mismatch rejected, network failure does not break the import

## 6. Phase 1 — Orchestrator + endpoint

- [x] 6.1 Implement `src/lib/import/index.ts` exporting `importFromUrl(url): Promise<ImportResult>` that: detects host (Instagram → route to phase-2 module if present, else generic), fetches HTML via `safeFetchText` with `text/html` allowlist, runs JSON-LD extractor, runs OG fallback if no JSON-LD recipe, downloads image, returns `ImportResult` shaped to feed `RecipeForm` `initialData`
- [x] 6.2 Implement `src/app/api/import/route.ts` `POST` handler: auth check (401 if missing), JSON body parse, URL syntactic validation, call `importFromUrl`, return result
- [x] 6.3 Endpoint integration test (fixtures-based): valid URL → 200 with mapped data; bad URL → 4xx; unauthed → 401

## 7. Phase 1 — Frontend

- [x] 7.1 Add an "Import from URL" block at the top of `src/app/recipes/new/page.tsx` (visible to authenticated contributors only): URL input, Import button, loading state, inline error
- [x] 7.2 On successful import, populate `RecipeForm` `initialData` with the response (verify the existing `initialData` shape matches what the import returns; adjust the import response shape if needed rather than the form prop)
- [x] 7.3 On import failure, render the empty form so manual entry still works
- [ ] 7.4 Manual test: paste 3 real recipe URLs including `mykoreankitchen.com/kimchi-jjigae` — confirm each pre-fills the form correctly and saves through the normal create-recipe path

## 8. Phase 1 — Ship

- [x] 8.1 Run lint + full jest suite locally — green
- [ ] 8.2 Deploy to Fly; smoke-test the endpoint against one real URL in production
- [ ] 8.3 Merge `change/import-recipe-from-url` Phase-1 commits to main and `git push`
- [ ] 8.4 **Checkpoint with the user before starting Phase 2** — confirm Phase 1 is acceptable and Phase 2 spike should run

## 9. Phase 2 — Instagram research spike

- [ ] 9.1 Pick 5 `@kenzoeats` toddler-recipe post URLs (mix of image posts, carousels, and reels)
- [ ] 9.2 For each URL, test against three strategies and record results in `discussion.md`:
  - `https://www.instagram.com/api/v1/oembed/?url=...` (note whether token is required)
  - Public-page HTML scrape (does it return real caption HTML or a login wall?)
  - The legacy `?__a=1&__d=dis` JSON endpoint
- [ ] 9.3 Document hit rate, what fields each strategy returns (caption, thumbnail, video URL?), and whether scraping looks stable
- [ ] 9.4 Decision: write a `discussion.md` entry stating "ship Phase 2 with strategy X" or "punt Phase 2 to a follow-up change because Y"; if punting, archive the change with Phase 2 tasks unchecked + the documented reason and stop here

## 10. Phase 2 — Implementation (conditional on 9.4)

- [ ] 10.1 Implement `src/lib/import/instagram.ts`: detect IG host in orchestrator, call the chosen strategy, return raw `{ caption, thumbnailUrl }`
- [ ] 10.2 Implement caption parser: first non-empty line → title; case-insensitive `ingredients:` / `instructions:|method:|directions:` headers delimit blocks; reuse ingredient parser for ingredient lines; if no recognised headers, dump the caption into `description`
- [ ] 10.3 Download the thumbnail via `safeFetchBytes` and create a `Photo` like Phase 1
- [ ] 10.4 Unit tests against captured `@kenzoeats` caption fixtures
- [ ] 10.5 Manual test: import 3 of the 5 spike URLs end-to-end

## 11. Phase 2 — Ship (conditional on 10.x complete)

- [ ] 11.1 Lint + tests green
- [ ] 11.2 Deploy + smoke-test one IG URL in production
- [ ] 11.3 Merge to main, push

## 12. Pre-archive

- [ ] 12.1 Run pre-archive checklist (git clean, all tasks `[x]` or explicitly waived, delta specs synced to main specs)
- [ ] 12.2 Surface checklist to user via Obsidian for sign-off
- [ ] 12.3 Archive the change

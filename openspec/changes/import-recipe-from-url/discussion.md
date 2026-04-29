# Discussion — import-recipe-from-url

## 2026-04-29 — feedback round 1

**Raised:** Add `https://mykoreankitchen.com/kimchi-jjigae/#recipe` as a test case, and do a live POC at the start of Phase 1 to surface real-world challenges such as bot detection before building out the full parser.

**Resolved:** Adding a POC task (1.5) at the start of Phase 1: live-fetch the kimchi jjigae URL and log the raw response status/headers/body to confirm reachability, bot-detection behaviour, and whether JSON-LD is present as expected. This runs before writing any parser logic, so any surprises (Cloudflare wall, auth redirect, missing JSON-LD) are caught early and can feed back into the design before we're committed to an implementation path. The URL is also added as a named fixture/test case in the unit tests.

**Spec impact:** no change to spec requirements — this is a task ordering adjustment and an additional test fixture.

## 2026-04-29 — POC live fetch results (task 2.1–2.2)

**Findings:**
- `mykoreankitchen.com/kimchi-jjigae/` → **HTTP 403 from Cloudflare** regardless of User-Agent spoofing. The site uses Cloudflare's bot management which requires a JS challenge — server-side fetches cannot solve it.
- `allrecipes.com`, `simplyrecipes.com`, `budgetbytes.com` → also 403 via Cloudflare.
- `recipetineats.com` (no Cloudflare) → **200 OK**, rich JSON-LD with `name`, 16 ingredients, 13 instructions, multiple images. Full fixture saved to `__fixtures__/recipetineats.html`.

**Decision:** Cloudflare-protected sites (a large fraction of big-name recipe sites) will not work without a headless browser — ruled out in design.md. **We accept this as a known limitation.** The feature error path ("this URL could not be imported — add manually") handles it gracefully. Many smaller recipe sites, food blogs, and personal recipe pages do not use aggressive bot protection and will work fine.

**No design change needed.** The `mykoreankitchen.html` fixture is the Cloudflare error page — we keep it as a negative fixture (import returns an HTTP error). The `recipetineats.html` fixture is our primary happy-path fixture. We'll capture one more no-CDN fixture for the unit tests.

**Adjusted UA:** Update `safeFetchText` User-Agent to the full Chrome string used in POC (already set in implementation). Sites that use basic UA-sniffing (not full bot management) will pass through.

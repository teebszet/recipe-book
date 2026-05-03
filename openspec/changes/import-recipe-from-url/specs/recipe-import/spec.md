## ADDED Requirements

### Requirement: Import recipe from a remote URL
The system SHALL provide a `POST /api/import` endpoint that accepts a JSON body `{ "url": <string> }` and returns a JSON document containing recipe fields (title, description, ingredients, instructions, tags) and any photos that were downloaded as part of the import. The endpoint SHALL require contributor authentication. The endpoint SHALL NOT persist a recipe — it returns parsed data for the contributor to review in the existing recipe form, which submits via the existing create-recipe endpoint.

#### Scenario: Authenticated import of a JSON-LD recipe URL
- **WHEN** an authenticated contributor sends `POST /api/import` with `{ "url": "https://example.com/some-recipe" }` where the page contains valid `schema.org/Recipe` JSON-LD
- **THEN** the system returns a 200 response containing parsed `title`, `description`, `ingredients[]`, `instructions[]`, `tags[]` fields plus any successfully-downloaded `photos[]` (with `id`, `url`)

#### Scenario: Unauthenticated import attempt
- **WHEN** an unauthenticated request is sent to `POST /api/import`
- **THEN** the system returns 401 Unauthorized and does not perform any outbound fetch

#### Scenario: Import response feeds the recipe form
- **WHEN** a contributor pastes a URL in the "Import from URL" UI on `/recipes/new` and the import succeeds
- **THEN** the recipe form is pre-filled with the returned fields, the contributor can edit any field, and tapping Save creates the recipe via the normal create-recipe path

### Requirement: Server-side URL fetch safety envelope
All outbound HTTP performed by the import flow SHALL go through a single safe-fetch helper that enforces: scheme is `http` or `https`; the resolved IP is not in any private, loopback, or link-local range (re-checked on every redirect); response size is bounded; a hard timeout applies; the response `Content-Type` matches an expected allowlist for that call site; redirect count is bounded.

#### Scenario: Private-IP target rejected
- **WHEN** the import flow is asked to fetch a URL whose hostname resolves to `127.0.0.1`, `169.254.169.254`, or any RFC1918 address
- **THEN** the fetch is rejected before any network connection is made and the import endpoint returns an error indicating the URL is not allowed

#### Scenario: DNS rebinding via redirect blocked
- **WHEN** the initial fetch resolves to a public IP but a 302 redirect points to a hostname that resolves to a private IP
- **THEN** the redirect is rejected and the import endpoint returns an error

#### Scenario: Oversized response truncated and rejected
- **WHEN** the target URL serves an HTML response larger than 2MB
- **THEN** the fetch aborts and the import returns an error indicating the page is too large to parse

#### Scenario: Slow target times out
- **WHEN** the target URL has not returned headers within the configured timeout
- **THEN** the fetch aborts and the import returns an error indicating the source did not respond

#### Scenario: Wrong content type rejected
- **WHEN** the page fetch receives a `Content-Type` of `application/octet-stream` instead of `text/html` (or compatible)
- **THEN** the response is rejected and the import returns an error

#### Scenario: Non-http(s) scheme rejected
- **WHEN** the import endpoint receives a URL with scheme `file://` or `gopher://` or any non-`http`/`https` scheme
- **THEN** the fetch is rejected before any network connection is made

### Requirement: Parse JSON-LD `schema.org/Recipe`
When a fetched page contains one or more `<script type="application/ld+json">` blocks, the system SHALL search those blocks for a `Recipe` object (directly, in an array, or under a `@graph` key) and map its fields to our recipe schema:
- `name` → `title`
- `description` → `description`
- `recipeIngredient` (array of strings) → `ingredients[]`, each parsed via the existing ingredient parser; on parse failure, the whole string SHALL become the ingredient `name` with empty quantity/unit/notes
- `recipeInstructions` (string, array of strings, or array of `HowToStep`) → `instructions[]` in order
- `image` (string or array) → first image URL is downloaded as a photo via the safe-fetch helper and stored via the existing upload pipeline
- `recipeCategory` and `keywords` (string or array) → `tags[]`, lowercased and de-duplicated

#### Scenario: Site with valid JSON-LD Recipe object
- **WHEN** the fetched HTML contains `<script type="application/ld+json">{"@type":"Recipe","name":"Pasta","recipeIngredient":["200g spaghetti","2 eggs"],"recipeInstructions":[{"@type":"HowToStep","text":"Boil water"}],"image":"https://cdn.example.com/p.jpg"}</script>`
- **THEN** the import response contains `title: "Pasta"`, two parsed ingredients, one instruction step, and one downloaded photo

#### Scenario: JSON-LD inside a `@graph` array
- **WHEN** the page exposes JSON-LD as `{"@context":"...","@graph":[{...},{"@type":"Recipe",...}]}`
- **THEN** the system finds the `Recipe` node inside `@graph` and maps it correctly

#### Scenario: Multiple JSON-LD blocks
- **WHEN** the page has two `<script type="application/ld+json">` blocks and only the second contains a `Recipe`
- **THEN** the system iterates over all blocks and uses the first `Recipe` it finds

#### Scenario: Malformed JSON-LD does not crash the import
- **WHEN** a JSON-LD block contains invalid JSON
- **THEN** the system logs the parse error, skips that block, and continues to the next JSON-LD block or the OG fallback

### Requirement: Open Graph fallback when no JSON-LD recipe is present
When no `schema.org/Recipe` JSON-LD is found in the page, the system SHALL fall back to Open Graph metadata. `og:title` (or `<title>`) SHALL become the recipe `title`. `og:description` SHALL become the recipe `description`. `og:image` SHALL be downloaded as the first photo. `ingredients[]` and `instructions[]` SHALL be empty in the response so the contributor fills them manually.

#### Scenario: Page with no JSON-LD but valid OG tags
- **WHEN** the fetched page has no JSON-LD recipe but does have `<meta property="og:title" content="Best Cake"/>`, `<meta property="og:description" content="A cake recipe"/>`, `<meta property="og:image" content="https://cdn.example.com/cake.jpg"/>`
- **THEN** the import response contains `title: "Best Cake"`, `description: "A cake recipe"`, one downloaded photo, and empty `ingredients`/`instructions`

#### Scenario: Page with neither JSON-LD nor OG
- **WHEN** the fetched page has neither JSON-LD nor OG tags
- **THEN** the import returns an error indicating the URL could not be parsed; the contributor is told to add the recipe manually

### Requirement: Image download through existing upload pipeline
When the import flow downloads an image, the bytes SHALL be passed through the same validation pipeline as user-uploaded photos: 10MB size cap, magic-byte validation against the claimed MIME type (JPEG/PNG/WebP), UUID-based filename, and storage in the configured upload directory. The resulting `Photo` record SHALL be associated with the imported-recipe response so the form can render it as an existing photo.

#### Scenario: Successful image download
- **WHEN** a JSON-LD `image` URL points to a valid 800KB JPEG
- **THEN** the system downloads it, validates magic bytes, stores it with a UUID filename, creates a `Photo` row, and returns `{ id, url }` in the import response

#### Scenario: Image too large
- **WHEN** the `image` URL serves a 15MB file
- **THEN** the download aborts at the size cap, no `Photo` is created, and the import response returns successfully without the photo (the rest of the recipe data is still useful)

#### Scenario: Image content-type mismatch
- **WHEN** the URL claims `image/jpeg` but the magic bytes match a PDF
- **THEN** the file is rejected, no `Photo` is created, and the import succeeds without the photo

### Requirement: Instagram URL detection (Phase 2 — research-gated)
The system SHALL detect Instagram post URLs (hosts `instagram.com`, `www.instagram.com`) and route them to an Instagram-specific parser. The Phase 2 implementation outcome (caption parsing + thumbnail, or "import not supported, use manual entry") is determined by a research spike documented in `discussion.md`. If the spike concludes Instagram cannot be supported reliably without authenticated Meta APIs, the system SHALL return a clear error directing the contributor to add the recipe manually, and Phase 2 implementation moves to a follow-up change.

#### Scenario: Instagram URL recognised
- **WHEN** an authenticated contributor submits `POST /api/import` with `{ "url": "https://www.instagram.com/p/ABC123/" }`
- **THEN** the system routes the URL to the Instagram-specific parser (or the documented "not supported" error path)

#### Scenario: Non-Instagram URL on the same domain
- **WHEN** the URL is `https://www.instagram.com/about` (not a post)
- **THEN** the system either parses it as a generic page (Phase 1 path) or rejects with a clear error — implementation MAY choose either, documented in design.md after the spike

### Requirement: Caption parsing for Instagram (Phase 2 — conditional)
If the Phase 2 spike concludes captions and a thumbnail are reliably extractable without Meta authentication, the system SHALL: take the first non-empty line of the caption as `title`; look for case-insensitive headers `ingredients:` and any of `instructions:`/`method:`/`directions:` to delimit ingredient and instruction blocks; pass each ingredient line through the existing parser; place all instruction lines after the instructions header into `instructions[]`. If no recognised headers are present, the entire caption SHALL go into `description` and `ingredients`/`instructions` SHALL be left empty.

#### Scenario: Caption with structured ingredients and instructions sections
- **WHEN** the IG caption is `Veggie nuggets\n\nIngredients:\n200g sweet potato\n1 egg\n\nInstructions:\nMash sweet potato\nMix in egg\nBake at 180C`
- **THEN** the import returns `title: "Veggie nuggets"`, two ingredients, three instruction steps, and the post's thumbnail as a photo

#### Scenario: Caption with no recognised structure
- **WHEN** the caption is a free-form paragraph with no `ingredients:` or `instructions:` headers
- **THEN** the import returns the first line as `title`, the remainder as `description`, empty ingredients/instructions, and the thumbnail as a photo

### Requirement: Import endpoint contributor auth
The `POST /api/import` endpoint SHALL require the same `Authorization` header check as other write endpoints. Unauthenticated requests SHALL receive 401 and SHALL NOT trigger any outbound HTTP fetch.

#### Scenario: Unauth request blocked before fetch
- **WHEN** an unauthenticated request hits `POST /api/import` with a valid-looking URL
- **THEN** the response is 401 and no outbound network request is made

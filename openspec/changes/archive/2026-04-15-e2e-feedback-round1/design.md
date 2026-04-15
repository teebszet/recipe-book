## Context

The recipe book app is deployed on Fly.io with a standalone Next.js build. First round of E2E testing revealed several bugs and UX issues. The most critical is that uploaded photos return 404 because the Next.js standalone server only serves files from the `public/` directory baked into the image, not from the Fly volume at `/data/uploads`. Tags also fail to save, the recipe form is hard to use on mobile, and the homepage has a redundant search bar.

## Goals / Non-Goals

**Goals:**
- Fix all bugs found in E2E testing (photo serving, tag saving, FAB centering)
- Improve recipe form ergonomics (keyboard flow, mobile layout, ingredient reorder)
- Add photo management on edit
- Remove redundant homepage search bar
- Add user-facing validation cues and upload feedback

**Non-Goals:**
- Image optimisation/resizing (can use Next.js Image with unoptimized flag for now)
- Drag-and-drop reordering (arrow buttons are sufficient)
- Photo cropping or editing
- Batch photo upload progress (individual upload is fine)

## Decisions

### 1. Photo serving: API route to stream files

Create `GET /api/uploads/[filename]` that reads from `UPLOAD_DIR` and streams the file. This avoids symlink hacks and works reliably with the standalone build and Fly volumes.

**Alternatives considered:**
- Symlink `/data/uploads` → `public/uploads` in `start.sh`: fragile, standalone build may not serve dynamically added files from `public/`.
- Serve via nginx sidecar: adds complexity for no benefit at this scale.

Update `next.config.ts` to set `images.unoptimized: true` so Next.js Image component works with the API route without needing `remotePatterns`.

### 2. Tag saving: diagnose and fix

The tag saving bug needs investigation. The form sends tags in the POST body, and the API handler does `prisma.tag.upsert` + creates `RecipeTag` records. Likely causes: tags array empty on arrival, or the upsert/create failing silently. Fix whichever is broken.

### 3. Recipe form keyboard flow: Enter/Shift+Enter to add rows

On the last ingredient row, pressing Enter on any field adds a new ingredient row and focuses the name field. Same for instruction steps. This keeps the keyboard-driven workflow flowing without requiring mouse clicks on "+ Add ingredient".

### 4. Ingredient reordering: up/down arrows (same as instructions)

Add the same move up/down arrow controls that instructions already have. Consistent UI pattern.

### 5. Ingredient row layout: stack on mobile

On mobile (< 640px), stack the ingredient fields vertically (name full-width, then qty/unit/notes in a row below). On desktop keep the single-row layout but give name more width.

### 6. Photo management on edit: show existing + allow add/remove

When editing a recipe, show existing photos with a remove button on each. Allow adding new photos. Photo upload uses the existing `POST /api/recipes/[id]/photos` endpoint. Photo deletion needs a new `DELETE /api/photos/[id]` endpoint.

### 7. Remove HomeSearch component

Delete `HomeSearch.tsx` and remove it from the homepage. The header search bar is always present and sufficient.

## Risks / Trade-offs

- **API route for photos adds latency vs static serving**: Negligible for a single-user/small-team app. Could add `Cache-Control` headers to mitigate.
- **`images.unoptimized: true` disables Next.js image optimisation**: Acceptable for now. Photos are uploaded as-is. Can add server-side resize later.
- **Enter key in form fields**: Could conflict with textarea submit behaviour. Only apply to single-line inputs (ingredients), not textareas (instructions use Shift+Enter or a button).

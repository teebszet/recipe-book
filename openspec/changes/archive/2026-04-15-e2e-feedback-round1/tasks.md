## 1. Bug Fixes

- [x] 1.1 Create API route GET /api/uploads/[filename] to stream photos from UPLOAD_DIR with content-type and cache headers
- [x] 1.2 Add path traversal protection (reject filenames with .. or /)
- [x] 1.3 Update next.config.ts: set images.unoptimized to true
- [x] 1.4 Update photo URLs in Image components to use /api/uploads/ prefix (or keep /uploads/ and rewrite)
- [x] 1.5 Diagnose and fix tags not saving on recipe create/edit
- [x] 1.6 Fix FAB "+" vertical centering (add leading-none or use SVG icon)

## 2. Remove Redundant Search

- [x] 2.1 Remove HomeSearch component from homepage
- [x] 2.2 Delete HomeSearch.tsx

## 3. Recipe Form — Keyboard Flow

- [x] 3.1 Add Enter key handler on ingredient fields: add new row + focus name when pressing Enter on last row
- [x] 3.2 Add Shift+Enter handler on instruction textarea: add new step + focus when on last step

## 4. Recipe Form — Ingredient Improvements

- [x] 4.1 Add up/down arrow reorder buttons to ingredient rows (matching instruction pattern)
- [x] 4.2 Make ingredient row layout responsive: stack name full-width on mobile, qty/unit/notes on second row
- [x] 4.3 Widen ingredient name field on desktop (give it more flex weight)

## 5. Photo Management on Edit

- [x] 5.1 Create API route DELETE /api/photos/[id] (with auth, delete file + DB record)
- [x] 5.2 Show existing photos in RecipeForm when editing (fetch from recipe data)
- [x] 5.3 Add remove button on each existing photo (calls DELETE endpoint)
- [x] 5.4 Allow adding new photos when editing (remove the !recipeId guard on photo upload section)
- [x] 5.5 Upload new photos immediately on selection (not deferred to form submit)

## 6. Form UX Polish

- [x] 6.1 Add required field indicators (asterisk or text) on title, ingredient name, instruction text
- [x] 6.2 Add photo format and size guidance text near upload input ("JPEG, PNG, or WebP — max 10MB")

## 7. Deploy & Verify

- [x] 7.1 Build and run tests locally
- [x] 7.2 Deploy to Fly.io
- [x] 7.3 Verify photo loading works on deployed app
- [x] 7.4 Verify tag saving works
- [x] 7.5 Verify form improvements on mobile viewport

# E2E Testing Feedback — Round 1

Date: 2026-04-15
App: https://recipe-book-holy-dew-1625.fly.dev/

## Bugs

- [user] uploaded photo not able to be loaded for first recipe (404 on /uploads/...)
  - Root cause: photos upload to UPLOAD_DIR (/data/uploads on Fly) but Next.js standalone only serves from public/. Need an API route to serve uploaded files, or symlink /data/uploads into the static dir.
- [user] tags are not saving
  - Confirmed: API returns `"tags": []` for the recipe. Tags are sent in POST body and the create handler does upsert — need to investigate why tags array arrives empty or the upsert fails silently. May also be a frontend issue (tags state not included in submission).
- [user] add recipe button (+) is not vertically centered
  - The FAB uses `text-2xl` for the "+" character which doesn't vertically center in the flex container. Needs `leading-none` or explicit line-height fix.
- [user] ingredients form name field is not wide enough to see what the field is for
  - The name field uses `flex-1` but on mobile or narrow viewports, the 4-column layout (name/qty/unit/notes) compresses the name field. Placeholder "Name" gets truncated.
- [user] edit form cannot edit the uploaded photo
  - Confirmed: RecipeForm hides the photo upload section entirely when `recipeId` is set (line 415: `{!recipeId && ...}`). No way to add/remove photos on edit.

## UX Issues

- [user] add recipe form: want to add multiple ingredients without leaving keyboard (tab or shift+enter to add new row)
- [user] allow reordering ingredients in form (only instructions have move up/down arrows)
- [user] similar keyboard flow issue with adding instruction steps
- [QA] ingredient row layout is 4 equal-ish columns on one line — on mobile this makes each field tiny and unusable. Should stack or use a more responsive layout.
- [QA] no visual indication of required fields (title, at least 1 ingredient, at least 1 instruction) — user only sees errors after submit
- [QA] photo upload has no indication of accepted formats or 10MB size limit in the UI
- [QA] search from header doesn't clear/reset when navigating back to homepage
- [QA] no loading/feedback state when uploading photos after recipe save — user sees nothing while photos upload

## Missing / Broken Functionality

- [QA] photo serving broken in production (404) — Next.js standalone doesn't serve /data/uploads. Need either:
  1. An API route like GET /api/uploads/[filename] that streams the file, or
  2. A symlink from public/uploads -> /data/uploads in the start.sh script
- [QA] no way to delete individual photos from a recipe
- [QA] Next.js Image component requires explicit `images.remotePatterns` or `images.unoptimized` config — currently no config for local upload paths, which may cause issues

## Visual / Layout Issues

- [QA] FAB "+" text not vertically centered in circle (baseline offset from line-height)
- [QA] ingredient form fields collapse on mobile — 4 inline fields don't fit
- [QA] no max-width on the recipe form — on wide screens the form stretches full width of the container

## Notes

- Search works correctly (case-insensitive, both title and ingredient matching)
- Auth flow works (contributor login, logout, session persistence)
- Recipe CRUD works (create, view, edit, delete) aside from the tag and photo bugs
- Health check passing, DB connected, migration runs on startup
- Recently viewed tracking works on homepage

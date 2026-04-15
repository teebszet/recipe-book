## Why

First round of E2E testing on the deployed app (Fly.io) revealed bugs, UX friction, and missing functionality. Photos don't load in production (404), tags don't save, the recipe form is hard to use on mobile and lacks keyboard-driven workflow, and the homepage has a redundant search bar.

## What Changes

- Fix photo serving in production (uploads stored on volume aren't served by Next.js standalone)
- Fix tags not saving when creating/editing recipes
- Fix FAB "+" button vertical centering
- Remove duplicate homepage search bar (keep header search only)
- Improve recipe form ergonomics: keyboard shortcuts to add ingredient/instruction rows, ingredient reordering, responsive mobile layout
- Add photo management on edit (add/remove photos for existing recipes)
- Add visual cues: required field indicators, accepted photo formats/size, upload progress feedback
- Fix ingredient name field width on narrow viewports

## Capabilities

### New Capabilities

### Modified Capabilities
- `recipe-management`: Photo serving in production, tag saving fix, photo editing on existing recipes, form UX improvements (keyboard flow, ingredient reorder, mobile layout, required field indicators, photo upload feedback)
- `recipe-browsing`: Remove redundant homepage hero search bar, fix FAB centering

## Impact

- API: New route or static serving mechanism for uploaded photos
- Components: RecipeForm (major UX rework), AddRecipeFab (centering fix), HomeSearch (removal)
- Config: next.config.ts may need images config for local uploads
- Pages: Homepage (remove HomeSearch), recipe detail (photo serving)
- Deployment: start.sh may need symlink or new serving approach for /data/uploads

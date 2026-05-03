## 1. Branding constant

- [x] 1.1 Create `src/lib/branding.ts` exporting `export const APP_NAME = "food le pop"`
- [x] 1.2 Verify the constant compiles cleanly (`npx tsc --noEmit`)

## 2. Wire constant into surfaces

- [x] 2.1 Update `src/app/layout.tsx` to import `APP_NAME` and use it in `metadata.title` and `metadata.description`
- [x] 2.2 Update `src/components/Header.tsx` to import `APP_NAME` and render it in the wordmark
- [x] 2.3 Update `README.md` heading to "food le pop" (markdown — hard-coded string is fine; constant doesn't apply)

## 3. Drift check

- [x] 3.1 Search the repo for the literal "Recipe Book" (case-insensitive) under `src/`, `public/`, `README.md`; confirm no remaining user-visible occurrences. Tests, comments referencing history, and the npm package name are acceptable to leave.
- [x] 3.2 Update any test that asserts on the old name string

## 4. Verify locally

- [x] 4.1 Run `npm run lint` — must pass
- [x] 4.2 Run the existing Jest suite — must pass
- [x] 4.3 Run `npm run dev`, load the homepage, and confirm: header shows "food le pop"; browser tab shows "food le pop"; view-source shows the new metadata description

## 5. Ship

- [x] 5.1 Commit on branch `change/rename-to-food-le-pop` with message `feat(branding): rename to food le pop`
- [x] 5.2 Merge to main and push (per agent ship protocol)
- [ ] 5.3 Run pre-archive checklist and archive the change

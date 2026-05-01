## Why

The app currently presents itself as "Recipe Book" — a generic placeholder. The user wants the product to ship under the name **food le pop**. The wordmark, page title, and any other user-visible "Recipe Book" copy need to be replaced before further screenshots, demos, or sharing.

## What Changes

- Replace user-visible "Recipe Book" wordmark in the site header with "food le pop"
- Replace the HTML page title (`<title>`) and metadata description with the new name
- Update README headline so the repo presents the new name to anyone landing on it
- Lock the app name into a spec requirement so future edits can't silently revert or drift it
- **Out of scope**: renaming the npm package (`package-lock.json` churn for no user-facing benefit), renaming the git repo, renaming the deployed Fly app, regenerating favicon artwork. These can happen in follow-ups if desired.

## Capabilities

### New Capabilities
- `app-branding`: Defines the canonical product name and where it must appear in the UI and metadata. Single requirement: the app name. Locks the wordmark so future changes don't drift it silently.

### Modified Capabilities
<!-- None. -->

## Impact

- **Code**: `src/app/layout.tsx` (metadata), `src/components/Header.tsx` (wordmark), `README.md` (heading).
- **APIs**: none.
- **Schema / data**: none. No migration needed.
- **Dependencies**: none.
- **Deployment**: no infra changes; next deploy picks up the new name.
- **Tests**: existing tests reference "Recipe Book" only incidentally if at all; check `src/__tests__/` and update any string assertions.

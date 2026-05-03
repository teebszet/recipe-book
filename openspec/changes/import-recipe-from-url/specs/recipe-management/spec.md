## ADDED Requirements

### Requirement: Import recipe entry point on create-recipe page
The system SHALL display an "Import from URL" entry point on the recipe-creation page (`/recipes/new`), visible only to authenticated contributors. The entry point SHALL accept a URL, call `POST /api/import` server-side, and pre-fill the recipe form with the returned data so the contributor can review and edit before saving. The form SHALL submit through the existing create-recipe path — no new persistence path is introduced.

#### Scenario: Authenticated contributor uses Import from URL
- **WHEN** an authenticated contributor opens `/recipes/new`, pastes a recipe URL into the "Import from URL" field, and submits
- **THEN** the system shows a loading indicator while `POST /api/import` runs, then pre-fills the recipe form with the returned `title`, `description`, `ingredients`, `instructions`, `tags`, and any downloaded photos

#### Scenario: Import fails — fall back to empty form
- **WHEN** the import request returns an error (URL unreachable, no parseable content, oversized response, blocked IP, etc.)
- **THEN** the system displays an inline error message indicating the URL could not be imported, and the empty recipe form remains available for manual entry

#### Scenario: Import partial success
- **WHEN** the import returns title and image but no parseable ingredients (e.g. OG fallback path)
- **THEN** the form is pre-filled with the available fields and ingredients/instructions are empty for the contributor to complete before saving

#### Scenario: Entry point not visible to readers
- **WHEN** an unauthenticated user views `/recipes/new`
- **THEN** the "Import from URL" entry point is not displayed (the recipe-creation page itself is already gated by auth)

#### Scenario: Imported recipe is reviewed before save
- **WHEN** a contributor has imported a recipe and the form is pre-filled
- **THEN** no recipe is persisted until the contributor explicitly clicks Save; navigating away discards the in-memory imported data

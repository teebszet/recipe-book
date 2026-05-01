## ADDED Requirements

### Requirement: Canonical app name
The system SHALL present its product name as the exact string `food le pop` (lowercase, with spaces, no title-casing) wherever the name is shown to users. This includes, at minimum: the site header wordmark, the HTML document `<title>`, and the page-level metadata description. Code SHALL reference a single shared constant for this name; the literal string SHALL NOT be duplicated across components.

#### Scenario: Header wordmark
- **WHEN** any user (authenticated or not) views any page
- **THEN** the site header shows the wordmark `food le pop` (exactly that casing)

#### Scenario: Browser tab title
- **WHEN** a user opens any page of the app
- **THEN** the browser tab's title contains `food le pop`

#### Scenario: Document metadata
- **WHEN** a crawler or share-preview tool fetches a page and reads its `<head>` metadata
- **THEN** the metadata title resolves to `food le pop` and the description references the app by that name

#### Scenario: Single source of truth in code
- **WHEN** a contributor searches the codebase for the literal string `Recipe Book`
- **THEN** no occurrences are found in user-visible source files (header, layout, metadata, README)

#### Scenario: Drift prevention
- **WHEN** a future contributor adds a new surface that displays the app name (e.g. email, OG tags, share sheet)
- **THEN** the new surface imports the shared `APP_NAME` constant rather than hard-coding the string

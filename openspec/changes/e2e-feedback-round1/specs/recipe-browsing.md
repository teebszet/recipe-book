## MODIFIED Requirements

### Requirement: List all recipes
The system SHALL provide a paginated list of all recipes, ordered by most recently created first. Each list item SHALL display the recipe title, first photo (if any), tags, and creation date. The homepage SHALL NOT include a separate hero search bar — the header search bar serves as the single search entry point across all pages.

#### Scenario: Browse recipes with results
- **WHEN** a user views the recipe listing page
- **THEN** the system displays recipes in reverse chronological order with title, thumbnail photo, tags, and date. No hero search bar is displayed.

#### Scenario: Browse recipes with no recipes in the system
- **WHEN** a user views the recipe listing page and no recipes exist
- **THEN** the system displays an empty state message

#### Scenario: Paginated browsing
- **WHEN** a user scrolls through the recipe listing and more recipes exist beyond the current page
- **THEN** the system loads the next batch of recipes (infinite scroll)

## ADDED Requirements

### Requirement: Add Recipe FAB vertical centering
The Add Recipe FAB "+" icon SHALL be vertically and horizontally centered within the circular button.

#### Scenario: FAB renders correctly
- **WHEN** an authenticated contributor views any page with the FAB
- **THEN** the "+" character is visually centered in the circle (no baseline offset)

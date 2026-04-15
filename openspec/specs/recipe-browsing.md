## ADDED Requirements

### Requirement: List all recipes
The system SHALL provide a paginated list of all recipes, ordered by most recently created first. Each list item SHALL display the recipe title, first photo (if any), tags, and creation date. The homepage SHALL NOT include a separate hero search bar — the header search bar serves as the single search entry point across all pages. Other sort types deprioritised: recently created last, A-Z, Z-A.

#### Scenario: Browse recipes with results
- **WHEN** a user views the recipe listing page
- **THEN** the system displays recipes in reverse chronological order with title, thumbnail photo, tags, and date. No hero search bar is displayed.

#### Scenario: Browse recipes with no recipes in the system
- **WHEN** a user views the recipe listing page and no recipes exist
- **THEN** the system displays an empty state message

#### Scenario: Paginated browsing
- **WHEN** a user scrolls through the recipe listing and more recipes exist beyond the current page
- **THEN** the system loads the next batch of recipes (infinite scroll)

### Requirement: View recipe detail page
The system SHALL display a dedicated page for each recipe showing the full title, all photos, complete ingredient list with quantities and units, ordered instructions, tags, and creation date.

#### Scenario: View a recipe with photos
- **WHEN** a user navigates to a recipe detail page for a recipe with three photos
- **THEN** the system displays all three photos, the ingredient list, and the step-by-step instructions

#### Scenario: View a recipe with no photos
- **WHEN** a user navigates to a recipe detail page for a recipe with no photos
- **THEN** the system displays the recipe without a photo section, showing ingredients and instructions

### Requirement: Track recently viewed recipes
The system SHALL track which recipes a user has recently viewed, storing up to 20 entries in the browser's localStorage. The most recently viewed recipe SHALL appear first.

#### Scenario: Recipe is added to recently viewed
- **WHEN** a user views a recipe detail page
- **THEN** that recipe's ID and title are added to the top of the recently viewed list in localStorage

#### Scenario: Duplicate view updates position
- **WHEN** a user views a recipe that is already in their recently viewed list
- **THEN** that recipe moves to the top of the list without creating a duplicate entry

#### Scenario: Recently viewed list exceeds capacity
- **WHEN** a user has 20 recipes in their recently viewed list and views a new recipe
- **THEN** the oldest entry is removed and the new recipe is added to the top

### Requirement: Display recently viewed recipes
The system SHALL display a "Recently Viewed" section on the home page showing the user's recently viewed recipes. Each entry SHALL show the recipe title and thumbnail.

#### Scenario: User has recently viewed recipes
- **WHEN** a user visits the home page and has 5 recipes in their recently viewed list
- **THEN** the system displays those 5 recipes in the "Recently Viewed" section, most recent first

#### Scenario: User has no recently viewed recipes
- **WHEN** a user visits the home page with no recently viewed history
- **THEN** the "Recently Viewed" section is not displayed

### Requirement: Add Recipe FAB vertical centering
The Add Recipe FAB "+" icon SHALL be vertically and horizontally centered within the circular button.

#### Scenario: FAB renders correctly
- **WHEN** an authenticated contributor views any page with the FAB
- **THEN** the "+" character is visually centered in the circle (no baseline offset)
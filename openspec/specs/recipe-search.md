## ADDED Requirements

### Requirement: Homepage search bar as primary entry point
The system SHALL provide a prominent search bar on the homepage as the primary entry point for finding recipes. The search bar SHALL be positioned in the homepage hero/header area, not hidden behind navigation. Typing in the search bar and submitting SHALL navigate the user to a search results page with the query pre-filled.

#### Scenario: User searches from homepage
- **WHEN** a user types "chicken" into the homepage search bar and presses enter
- **THEN** the system navigates to the search results page with the query "chicken" pre-filled and results displayed

#### Scenario: Search bar is visible without scrolling
- **WHEN** a user lands on the homepage
- **THEN** the search bar is immediately visible above the fold without scrolling

#### Scenario: Search bar placeholder text
- **WHEN** the search bar is empty
- **THEN** it displays placeholder text guiding the user (e.g., "Search recipes by name or ingredient...")

### Requirement: Search recipes by title
The system SHALL allow users to search for recipes by title. The search SHALL be case-insensitive and match partial strings.

#### Scenario: Search with matching results
- **WHEN** a user searches for "carb"
- **THEN** the system returns recipes with titles containing "carb" (e.g., "Pasta Carbonara", "Low Carb Salad")

#### Scenario: Search with no results
- **WHEN** a user searches for "xylophone"
- **THEN** the system returns an empty result set with a message indicating no recipes were found

#### Scenario: Empty search query
- **WHEN** a user submits an empty search query
- **THEN** the system returns all recipes (equivalent to browsing)

### Requirement: Search recipes by ingredient
The system SHALL allow users to search for recipes that contain one or more specified ingredients. The search SHALL match ingredient names case-insensitively.

#### Scenario: Search by single ingredient
- **WHEN** a user searches for recipes containing "chicken"
- **THEN** the system returns all recipes that have an ingredient with "chicken" in the name

#### Scenario: Search by multiple ingredients
- **WHEN** a user searches for recipes containing "tomato" and "basil"
- **THEN** the system returns recipes that contain both "tomato" and "basil" in their ingredient lists

#### Scenario: Ingredient search with no matches
- **WHEN** a user searches for recipes containing "truffle oil"
- **THEN** the system returns an empty result set

### Requirement: Unified search across title and ingredients
The system SHALL use a single search bar that searches both recipe titles and ingredient names simultaneously. Results SHALL be ranked with title matches first, then ingredient matches. The search results page SHALL display matching recipes with title, thumbnail, tags, and matching context showing why each recipe matched.

#### Scenario: Query matches both title and ingredients
- **WHEN** a user searches for "tomato"
- **THEN** the system returns recipes with "tomato" in the title first, followed by recipes with "tomato" in their ingredients, each showing the match reason

#### Scenario: Search results display
- **WHEN** search results are returned
- **THEN** each result displays the recipe title, first photo thumbnail, tags, and a snippet showing why it matched (e.g., "Matched ingredient: tomato")

#### Scenario: Search results page retains query
- **WHEN** a user arrives at the search results page
- **THEN** the search bar at the top of the page is pre-filled with the current query and the user can refine it in place

### Requirement: Parameterised queries for all search operations
All search queries SHALL use Prisma's typed query builder with parameterised inputs. Raw SQL with interpolated user input SHALL NOT be used.

#### Scenario: SQL injection in title search
- **WHEN** a user searches for `'; DROP TABLE recipes; --`
- **THEN** the system treats the input as a literal string, returns no results, and the database is unaffected

#### Scenario: SQL injection in ingredient search
- **WHEN** a user searches for ingredients containing `' OR 1=1 --`
- **THEN** the system treats the input as a literal ingredient name, returns no results, and the database is unaffected
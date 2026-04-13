## ADDED Requirements

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

### Requirement: Combined search interface
The system SHALL provide a single search interface that allows users to search by title or by ingredients. The search results page SHALL display matching recipes with title, thumbnail, and matching context.

#### Scenario: Search from the header
- **WHEN** a user types a query into the search bar in the page header
- **THEN** the system performs a title search and displays results on a search results page

#### Scenario: Search results display
- **WHEN** search results are returned
- **THEN** each result displays the recipe title, first photo thumbnail, tags, and a snippet showing why it matched

### Requirement: Parameterised queries for all search operations
All search queries SHALL use Prisma's typed query builder with parameterised inputs. Raw SQL with interpolated user input SHALL NOT be used.

#### Scenario: SQL injection in title search
- **WHEN** a user searches for `'; DROP TABLE recipes; --`
- **THEN** the system treats the input as a literal string, returns no results, and the database is unaffected

#### Scenario: SQL injection in ingredient search
- **WHEN** a user searches for ingredients containing `' OR 1=1 --`
- **THEN** the system treats the input as a literal ingredient name, returns no results, and the database is unaffected
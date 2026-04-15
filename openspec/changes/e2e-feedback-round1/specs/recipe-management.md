## ADDED Requirements

### Requirement: Serve uploaded photos via API route
The system SHALL serve uploaded photos through `GET /api/uploads/[filename]` by streaming the file from the configured upload directory. The response SHALL include appropriate `Content-Type` and `Cache-Control` headers.

#### Scenario: Fetch an uploaded photo
- **WHEN** a user requests `GET /api/uploads/photo-uuid.jpg`
- **THEN** the system streams the file from the upload directory with `Content-Type: image/jpeg` and a cache header

#### Scenario: Fetch a non-existent photo
- **WHEN** a user requests `GET /api/uploads/nonexistent.jpg`
- **THEN** the system returns 404

#### Scenario: Path traversal attempt
- **WHEN** a user requests `GET /api/uploads/../../etc/passwd`
- **THEN** the system rejects the request (only serves files from the upload directory)

### Requirement: Delete individual photos
The system SHALL allow a contributor to delete individual photos from a recipe via `DELETE /api/photos/[id]`. The photo file SHALL be removed from the filesystem and the database record deleted.

#### Scenario: Delete an existing photo
- **WHEN** a contributor sends `DELETE /api/photos/photo-id` with valid auth
- **THEN** the system deletes the photo file and database record, returns success

#### Scenario: Delete photo without auth
- **WHEN** an unauthenticated request is sent to `DELETE /api/photos/photo-id`
- **THEN** the system returns 401

### Requirement: Keyboard-driven ingredient entry
The system SHALL allow contributors to add a new ingredient row by pressing Enter on any field in the last ingredient row. Focus SHALL move to the name field of the new row.

#### Scenario: Press Enter on last ingredient row
- **WHEN** a contributor presses Enter while focused on any field of the last ingredient row
- **THEN** a new empty ingredient row is added and the name field of the new row receives focus

#### Scenario: Press Enter on a non-last ingredient row
- **WHEN** a contributor presses Enter on an ingredient field that is not in the last row
- **THEN** focus moves to the next field (default tab behaviour), no new row is added

### Requirement: Keyboard-driven instruction entry
The system SHALL allow contributors to add a new instruction step by pressing Shift+Enter in the last instruction textarea. Focus SHALL move to the new step's textarea.

#### Scenario: Press Shift+Enter on last instruction step
- **WHEN** a contributor presses Shift+Enter in the textarea of the last instruction step
- **THEN** a new empty instruction step is added and its textarea receives focus

### Requirement: Ingredient reordering
The system SHALL allow contributors to reorder ingredients using up/down arrow buttons, matching the existing instruction reordering pattern.

#### Scenario: Move ingredient up
- **WHEN** a contributor clicks the up arrow on the second ingredient
- **THEN** the second ingredient swaps position with the first

#### Scenario: Move first ingredient up
- **WHEN** a contributor clicks the up arrow on the first ingredient
- **THEN** nothing happens (button is disabled)

### Requirement: Photo management on recipe edit
The system SHALL display existing photos when editing a recipe, each with a remove button. The system SHALL allow adding new photos to an existing recipe.

#### Scenario: View existing photos in edit form
- **WHEN** a contributor opens the edit form for a recipe with 2 photos
- **THEN** both existing photos are displayed with remove buttons

#### Scenario: Remove a photo from edit form
- **WHEN** a contributor clicks remove on an existing photo
- **THEN** the photo is deleted via the API and removed from the display

#### Scenario: Add a new photo on edit
- **WHEN** a contributor uploads a new photo while editing a recipe
- **THEN** the photo is uploaded immediately and displayed alongside existing photos

### Requirement: Required field indicators
The system SHALL visually indicate which form fields are required (title, at least one ingredient with a name, at least one instruction with text) before submission.

#### Scenario: Form loads with required indicators
- **WHEN** a contributor opens the add recipe form
- **THEN** title, ingredient name, and instruction text fields show a visual required indicator (e.g., asterisk or label text)

### Requirement: Photo upload format and size guidance
The system SHALL display accepted photo formats (JPEG, PNG, WebP) and maximum file size (10MB) near the upload input.

#### Scenario: Upload section shows constraints
- **WHEN** a contributor views the photo upload section
- **THEN** text indicating "JPEG, PNG, or WebP — max 10MB" is visible

## MODIFIED Requirements

### Requirement: Standardise ingredient format
The system SHALL store each ingredient as a structured object with name (required), quantity (optional), unit (optional), and notes (optional). The system SHALL normalise ingredient names to lowercase. The ingredient form SHALL use a responsive layout: on mobile (< 640px), the name field SHALL be full-width with quantity, unit, and notes on a second row.

#### Scenario: Ingredient with full details
- **WHEN** a contributor provides an ingredient "200g Parmigiano Reggiano, finely grated"
- **THEN** the system stores it as { name: "parmigiano reggiano", quantity: "200", unit: "g", notes: "finely grated" }

#### Scenario: Ingredient with only a name
- **WHEN** a contributor provides an ingredient "Salt"
- **THEN** the system stores it as { name: "salt", quantity: null, unit: null, notes: null }

#### Scenario: Ingredient form on mobile
- **WHEN** a contributor uses the form on a viewport under 640px wide
- **THEN** the ingredient name field takes full width, with quantity/unit/notes in a row below

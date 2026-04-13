## ADDED Requirements

### Requirement: Create a recipe
The system SHALL allow a contributor to create a new recipe by providing a title, ingredients, instructions, optional photos, and optional tags. The system SHALL standardise the recipe data into a consistent format upon saving.

#### Scenario: Successful recipe creation with all fields
- **WHEN** a contributor submits a recipe with title "Pasta Carbonara", a list of ingredients, ordered instructions, two photos, and tags ["italian", "pasta"]
- **THEN** the system creates the recipe, stores all fields in the standardised schema, and returns the created recipe with a unique ID

#### Scenario: Minimal recipe creation
- **WHEN** a contributor submits a recipe with only a title and at least one ingredient and one instruction step
- **THEN** the system creates the recipe successfully with empty photos and tags

#### Scenario: Recipe creation with missing required fields
- **WHEN** a contributor submits a recipe without a title, or without any ingredients, or without any instructions
- **THEN** the system rejects the submission and returns validation errors indicating which fields are missing

### Requirement: View a single recipe
The system SHALL allow any user to view the full details of a recipe by its ID, including title, description, all ingredients with quantities and units, ordered instructions, photos, and tags.

#### Scenario: View existing recipe
- **WHEN** a user requests a recipe by its ID
- **THEN** the system returns the complete recipe with all fields

#### Scenario: View non-existent recipe
- **WHEN** a user requests a recipe with an ID that does not exist
- **THEN** the system returns a not-found error

### Requirement: Update a recipe
The system SHALL allow a contributor to update any field of an existing recipe. Partial updates SHALL be supported — only the provided fields are changed.

#### Scenario: Update recipe title
- **WHEN** a contributor updates the title of an existing recipe
- **THEN** the system saves the new title and the updatedAt timestamp is refreshed

#### Scenario: Add a photo to an existing recipe
- **WHEN** a contributor adds a photo to an existing recipe
- **THEN** the photo is stored and associated with the recipe, and existing photos are preserved

#### Scenario: Update non-existent recipe
- **WHEN** a contributor attempts to update a recipe that does not exist
- **THEN** the system returns a not-found error

### Requirement: Delete a recipe
The system SHALL allow a contributor to delete a recipe. Deleting a recipe SHALL also remove its associated photos from storage.

#### Scenario: Successful deletion
- **WHEN** a contributor deletes an existing recipe
- **THEN** the recipe and its associated photo files are removed from the system

#### Scenario: Delete non-existent recipe
- **WHEN** a contributor attempts to delete a recipe that does not exist
- **THEN** the system returns a not-found error

### Requirement: Upload recipe photos
The system SHALL accept image uploads (JPEG, PNG, WebP) for recipes. Each recipe MAY have zero or more photos. Photos SHALL be stored on the server filesystem and served as static assets.

#### Scenario: Upload a valid image
- **WHEN** a contributor uploads a JPEG image for a recipe
- **THEN** the system stores the file, creates a photo record linked to the recipe, and returns the photo URL

#### Scenario: Upload an unsupported file type
- **WHEN** a contributor uploads a PDF file as a recipe photo
- **THEN** the system rejects the upload with an error indicating the file type is not supported

### Requirement: Standardise ingredient format
The system SHALL store each ingredient as a structured object with name (required), quantity (optional), unit (optional), and notes (optional). The system SHALL normalise ingredient names to lowercase.

#### Scenario: Ingredient with full details
- **WHEN** a contributor provides an ingredient "200g Parmigiano Reggiano, finely grated"
- **THEN** the system stores it as { name: "parmigiano reggiano", quantity: "200", unit: "g", notes: "finely grated" }

#### Scenario: Ingredient with only a name
- **WHEN** a contributor provides an ingredient "Salt"
- **THEN** the system stores it as { name: "salt", quantity: null, unit: null, notes: null }

### Requirement: Manage tags
The system SHALL support tagging recipes with lowercase string tags. Tags SHALL be reusable across recipes. Creating a recipe with a new tag name SHALL automatically create that tag.

#### Scenario: Create recipe with new tags
- **WHEN** a contributor creates a recipe with tags ["Thai", "Spicy"]
- **THEN** the system creates tag records "thai" and "spicy" (lowercased) if they don't exist, and associates them with the recipe

#### Scenario: Create recipe with existing tags
- **WHEN** a contributor creates a recipe with a tag "italian" that already exists
- **THEN** the system reuses the existing tag record

### Requirement: Write endpoints require authentication
All write operations (create, update, delete recipe; upload photo) SHALL require a valid `Authorization` header matching the configured shared password. Unauthenticated requests SHALL receive a 401 response.

#### Scenario: Create recipe without auth
- **WHEN** a request is sent to POST /api/recipes without a valid Authorization header
- **THEN** the system returns 401 Unauthorized and does not create the recipe

#### Scenario: Delete recipe without auth
- **WHEN** a request is sent to DELETE /api/recipes/[id] without a valid Authorization header
- **THEN** the system returns 401 Unauthorized and does not delete the recipe

### Requirement: Photo upload size and content validation
The system SHALL reject photo uploads larger than 10MB. The system SHALL generate random UUID-based filenames for all uploads, ignoring the original filename. The system SHALL validate that a file's magic bytes match the claimed image type (JPEG, PNG, WebP).

#### Scenario: Upload exceeding 10MB
- **WHEN** a contributor uploads an image file that is 15MB
- **THEN** the system rejects the upload with an error indicating max file size is 10MB

#### Scenario: Malicious filename
- **WHEN** a contributor uploads a file named `../../../etc/passwd.jpg`
- **THEN** the system stores the file with a generated UUID filename, ignoring the original name

#### Scenario: Mismatched content type
- **WHEN** a contributor uploads a file named `photo.jpg` whose magic bytes indicate it is a PDF
- **THEN** the system rejects the upload as an invalid file type

### Requirement: Input rendered safely
All user-provided text fields (title, description, ingredient names/notes, instruction text) SHALL be rendered via React's default JSX escaping. The system SHALL NOT use `dangerouslySetInnerHTML` on any user content.

#### Scenario: Script tag in recipe title
- **WHEN** a recipe is created with title `<script>alert(1)</script>Cake`
- **THEN** the title is stored as-is but rendered as escaped text, not executable HTML

#### Scenario: HTML in instruction step
- **WHEN** a recipe instruction contains `<img src=x onerror=alert(1)>`
- **THEN** the instruction is rendered as escaped text in the frontend
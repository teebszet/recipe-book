## Security Audit

Audit date: 2026-04-12

### 1. No authentication or authorization — HIGH
Anyone with the URL can create, edit, and delete recipes. Even for family use, exposed write endpoints mean bots or crawlers could wipe all data.
- **Recommendation**: Protect write endpoints (POST/PUT/DELETE) behind basic shared-password auth middleware. Read endpoints can remain open.

### 2. File upload without sanitisation — HIGH
Photo upload validates file type but lacks:
- File size limits (no max = disk fill risk)
- Filename sanitisation (path traversal via `../../` in filenames)
- Content validation (MIME type alone is insufficient; magic bytes should be checked)
- **Recommendation**: Enforce 10MB max file size, generate random filenames server-side, validate magic bytes match claimed type.

### 3. SQL injection via search — MEDIUM
Prisma uses parameterised queries which mitigates most injection. Risk exists if raw SQL is used with string interpolation.
- **Recommendation**: All queries MUST use Prisma's typed query builder. Never use `$queryRaw` with interpolated user input.

### 4. No input sanitisation on recipe content — MEDIUM
Recipe titles, instructions, and ingredient notes are free text rendered in the frontend. Potential XSS vector.
- **Recommendation**: React's JSX escaping handles most cases. Never use `dangerouslySetInnerHTML` on user-provided content. If markdown rendering is added, use a sanitising library.

### 5. No rate limiting — LOW
No rate limiting on API endpoints. Spam risk on recipe creation and search.
- **Recommendation**: Add rate limiting middleware before public deployment.

### 6. SQLite file path — LOW
If the SQLite DB is stored under the Next.js project, ensure it is not inside `public/` (which is auto-served). Current design uses `./data/recipes.db` which is safe.

## ADDED Requirements

### Requirement: Protect write endpoints with shared auth
The system SHALL require a shared password (configured via environment variable) for all write operations (POST, PUT, DELETE). Read operations (GET) SHALL remain publicly accessible. Authentication SHALL use a simple middleware that checks an `Authorization` header against the configured password.

#### Scenario: Authenticated write request
- **WHEN** a contributor sends a POST/PUT/DELETE request with a valid `Authorization` header matching the configured password
- **THEN** the system processes the request normally

#### Scenario: Unauthenticated write request
- **WHEN** a request is sent to a write endpoint without an `Authorization` header or with an incorrect password
- **THEN** the system returns a 401 Unauthorized error and does not process the request

#### Scenario: Read requests remain open
- **WHEN** any user sends a GET request to any endpoint
- **THEN** the system processes the request without requiring authentication

### Requirement: Secure file upload handling
The system SHALL enforce file size limits, generate server-side filenames, and validate file content for all photo uploads.

#### Scenario: File exceeds size limit
- **WHEN** a contributor uploads an image larger than 10MB
- **THEN** the system rejects the upload with an error indicating the file is too large

#### Scenario: Filename with path traversal
- **WHEN** a contributor uploads a file with a name containing `../` or other path traversal characters
- **THEN** the system ignores the original filename and generates a random UUID-based filename

#### Scenario: File content does not match extension
- **WHEN** a contributor uploads a file with a `.jpg` extension but the file's magic bytes indicate it is not a JPEG
- **THEN** the system rejects the upload with an error indicating the file type is invalid

### Requirement: Parameterised database queries only
The system SHALL use Prisma's typed query builder for all database operations. Raw SQL queries with interpolated user input SHALL NOT be used.

#### Scenario: Search with SQL injection attempt
- **WHEN** a user submits a search query containing SQL injection characters (e.g., `'; DROP TABLE recipes; --`)
- **THEN** the system treats the input as a literal search string and returns results (or no results) without executing injected SQL

### Requirement: XSS prevention in rendered content
The system SHALL NOT use `dangerouslySetInnerHTML` or equivalent unescaped rendering for any user-provided content (titles, descriptions, ingredients, instructions). All user content SHALL be rendered through React's default JSX escaping.

#### Scenario: Recipe with HTML in title
- **WHEN** a contributor creates a recipe with title `<script>alert('xss')</script>Cake`
- **THEN** the system stores the title as-is but renders it as escaped text in the frontend, not as executable HTML
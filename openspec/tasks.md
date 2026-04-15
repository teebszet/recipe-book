## 1. Project Setup

- [x] 1.1 Initialise Next.js project with App Router and TypeScript
- [x] 1.2 Install and configure Prisma with SQLite
- [x] 1.3 Define Prisma schema (Recipe, Tag, Photo models with relations)
- [x] 1.4 Run initial migration and generate Prisma client
- [x] 1.5 Set up project directory structure (app routes, components, lib)

## 2. Recipe API

- [x] 2.1 Create API route: POST /api/recipes (create recipe with ingredients, instructions, tags)
- [x] 2.2 Create API route: GET /api/recipes/[id] (get single recipe with all relations)
- [x] 2.3 Create API route: PUT /api/recipes/[id] (partial update recipe)
- [x] 2.4 Create API route: DELETE /api/recipes/[id] (delete recipe and associated photos)
- [x] 2.5 Create API route: GET /api/recipes (list recipes, paginated, newest first)
- [x] 2.6 Add request validation (required fields: title, ingredients, instructions)
- [x] 2.7 Implement ingredient normalisation (lowercase names, structured parsing)

## 3. Photo Upload

- [x] 3.1 Create uploads directory and configure Next.js static serving
- [x] 3.2 Create API route: POST /api/recipes/[id]/photos (upload image, validate type)
- [x] 3.3 Enforce 10MB max file size on uploads
- [x] 3.4 Generate UUID filenames server-side, ignore original filename
- [x] 3.5 Validate file magic bytes match claimed image type (JPEG/PNG/WebP)
- [x] 3.6 Handle photo deletion when recipe is deleted (remove files from filesystem)

## 4. Search API

- [x] 4.1 Create API route: GET /api/recipes/search?q=... (title search, case-insensitive LIKE)
- [x] 4.2 Add ingredient search: GET /api/recipes/search?ingredients=... (match by ingredient names)
- [x] 4.3 Support combined search returning title, thumbnail, and match context

## 5. Security & Auth

- [x] 5.1 Create auth middleware: check `Authorization: Bearer <password>` header against `ADMIN_PASSWORD` env var
- [x] 5.2 Use constant-time string comparison in auth middleware
- [x] 5.3 Fail-closed: refuse all write requests if `ADMIN_PASSWORD` is not set
- [x] 5.4 Apply auth middleware to all write API routes (POST, PUT, DELETE)
- [x] 5.5 Build "Contributor login" link in header that opens auth modal
- [x] 5.6 Build auth modal UI: password prompt, error state for incorrect password
- [x] 5.7 Store password in sessionStorage on successful auth
- [x] 5.8 Show "Contributor" indicator and "Logout" option in header when authenticated
- [x] 5.9 Conditionally show/hide write CTAs (Add Recipe FAB, Edit, Delete) based on auth state
- [x] 5.10 Auto-attach Bearer token to all write requests from frontend
- [x] 5.11 On 401 response: clear session, revert to reader mode, re-show auth modal
- [x] 5.12 Logout: clear sessionStorage, hide write CTAs, revert header to "Contributor login"
- [x] 5.13 Ensure all DB queries use Prisma typed query builder, no raw SQL with user input
- [x] 5.14 Audit all components: verify no dangerouslySetInnerHTML on user-provided content

## 6. Frontend - Layout & Navigation

- [x] 6.1 Create root layout with header (search bar, contributor login link) and responsive structure
- [x] 6.2 Style global layout with clean, minimal design (CSS modules or Tailwind)
- [x] 6.3 Build responsive layout that works on mobile and desktop

## 7. Frontend - Recipe Browsing

- [x] 7.1 Build home page with recipe grid/list (title, thumbnail, tags, date)
- [x] 7.2 Implement pagination or infinite scroll for recipe listing (newest first by default)
- [x] 7.3 Build recipe detail page (photos, ingredients, instructions, tags)
- [x] 7.4 Build empty state for when no recipes exist
- [x] 7.5 Implement "Recently Viewed" section on home page using localStorage
- [x] 7.6 Add recently-viewed tracking logic (max 20 entries, dedup, FIFO eviction)

## 8. Frontend - Add/Edit Recipe

- [x] 8.1 Build "Add Recipe" form (title, description, ingredients, instructions, tags)
- [x] 8.2 Build dynamic ingredient input (add/remove rows with name, quantity, unit, notes)
- [x] 8.3 Build dynamic instruction steps input (add/remove/reorder steps)
- [x] 8.4 Add photo upload UI with preview
- [x] 8.5 Add tag input with autocomplete from existing tags
- [x] 8.6 Wire form submission to POST /api/recipes and photo upload endpoints (with auth token)
- [x] 8.7 Build "Edit Recipe" page reusing the form component with pre-filled data

## 9. Frontend - Search

- [x] 9.1 Wire header search bar to search results page
- [x] 9.2 Build search results page displaying matches with thumbnails and context
- [x] 9.3 Add empty state for no search results

## 10. Testing (target 80% code coverage)

- [x] 10.1 Set up Jest, configure coverage thresholds at 80%
- [x] 10.2 Unit test auth middleware (valid password, missing header, wrong password, unset ADMIN_PASSWORD)
- [x] 10.3 Unit test ingredient normalisation logic (structured parsing, lowercase, edge cases)
- [x] 10.4 Unit test recipe validation (required fields, missing fields, invalid data)
- [x] 10.5 Unit test recipe CRUD API handlers (create, read, update, delete)
- [x] 10.6 Unit test search logic (title matching, ingredient matching, empty queries)
- [x] 10.7 Unit test photo upload validation (size limit, magic bytes, UUID filename generation)
- [x] 10.8 Unit test tag management (creation, dedup, lowercase normalisation)
- [x] 10.9 Unit test recently-viewed localStorage logic (add, dedup, eviction at 20)
- [x] 10.10 Unit test contributor login flow (auth state, CTA visibility, logout)
- [x] 10.11 Integration test: full recipe CRUD cycle against test DB with auth
- [x] 10.12 Integration test: search returns correct results from seeded test data
- [x] 10.13 Integration test: unauthenticated write requests return 401

## 11. Deployment (Fly.io)

- [x] 11.1 Create Dockerfile (multi-stage build: deps, build, production)
- [x] 11.2 Create fly.toml with volume mount for /data (SQLite DB + uploads)
- [x] 11.3 Create .env.example with ADMIN_PASSWORD, DATABASE_URL, UPLOAD_DIR
- [x] 11.4 Add health check endpoint: GET /api/health
- [x] 11.5 Configure Fly.io health check in fly.toml
- [x] 11.6 Set up production build and start scripts in package.json
- [x] 11.7 Write deployment README: Fly.io account setup, flyctl install, fly launch, volume creation, secrets, deploy
- [ ] 11.8 Test deploy to Fly.io free tier and verify app works end-to-end

## 12. Polish & Verification

- [ ] 12.1 Test full CRUD flow end-to-end with auth (contributor login, create, view, edit, delete recipe)
- [ ] 12.2 Test search by title and by ingredients
- [ ] 12.3 Test recently viewed tracking across page navigations
- [ ] 12.4 Verify responsive layout on mobile viewport sizes
- [ ] 12.5 Verify auth flow: contributor login appears, wrong password rejected, correct password shows CTAs, logout hides CTAs
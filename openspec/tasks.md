## 1. Project Setup

- [ ] 1.1 Initialise Next.js project with App Router and TypeScript
- [ ] 1.2 Install and configure Prisma with SQLite
- [ ] 1.3 Define Prisma schema (Recipe, Tag, Photo models with relations)
- [ ] 1.4 Run initial migration and generate Prisma client
- [ ] 1.5 Set up project directory structure (app routes, components, lib)

## 2. Recipe API

- [ ] 2.1 Create API route: POST /api/recipes (create recipe with ingredients, instructions, tags)
- [ ] 2.2 Create API route: GET /api/recipes/[id] (get single recipe with all relations)
- [ ] 2.3 Create API route: PUT /api/recipes/[id] (partial update recipe)
- [ ] 2.4 Create API route: DELETE /api/recipes/[id] (delete recipe and associated photos)
- [ ] 2.5 Create API route: GET /api/recipes (list recipes, paginated, newest first)
- [ ] 2.6 Add request validation (required fields: title, ingredients, instructions)
- [ ] 2.7 Implement ingredient normalisation (lowercase names, structured parsing)

## 3. Photo Upload

- [ ] 3.1 Create uploads directory and configure Next.js static serving
- [ ] 3.2 Create API route: POST /api/recipes/[id]/photos (upload image, validate type)
- [ ] 3.3 Enforce 10MB max file size on uploads
- [ ] 3.4 Generate UUID filenames server-side, ignore original filename
- [ ] 3.5 Validate file magic bytes match claimed image type (JPEG/PNG/WebP)
- [ ] 3.6 Handle photo deletion when recipe is deleted (remove files from filesystem)

## 4. Search API

- [ ] 4.1 Create API route: GET /api/recipes/search?q=... (title search, case-insensitive LIKE)
- [ ] 4.2 Add ingredient search: GET /api/recipes/search?ingredients=... (match by ingredient names)
- [ ] 4.3 Support combined search returning title, thumbnail, and match context

## 5. Security & Auth

- [ ] 5.1 Create auth middleware: check `Authorization: Bearer <password>` header against `ADMIN_PASSWORD` env var
- [ ] 5.2 Use constant-time string comparison in auth middleware
- [ ] 5.3 Fail-closed: refuse all write requests if `ADMIN_PASSWORD` is not set
- [ ] 5.4 Apply auth middleware to all write API routes (POST, PUT, DELETE)
- [ ] 5.5 Build password modal UI: prompt on first write action, store password in sessionStorage
- [ ] 5.6 Auto-attach Bearer token to all subsequent write requests from frontend
- [ ] 5.7 Re-prompt password modal on 401 response (wrong/expired password)
- [ ] 5.8 Ensure all DB queries use Prisma typed query builder, no raw SQL with user input
- [ ] 5.9 Audit all components: verify no dangerouslySetInnerHTML on user-provided content

## 6. Frontend - Layout & Navigation

- [ ] 6.1 Create root layout with header, search bar, and navigation
- [ ] 6.2 Style global layout with clean, minimal design (CSS modules or Tailwind)
- [ ] 6.3 Build responsive layout that works on mobile and desktop

## 7. Frontend - Recipe Browsing

- [ ] 7.1 Build home page with recipe grid/list (title, thumbnail, tags, date)
- [ ] 7.2 Implement pagination or infinite scroll for recipe listing
- [ ] 7.3 Build recipe detail page (photos, ingredients, instructions, tags)
- [ ] 7.4 Build empty state for when no recipes exist
- [ ] 7.5 Implement "Recently Viewed" section on home page using localStorage
- [ ] 7.6 Add recently-viewed tracking logic (max 20 entries, dedup, FIFO eviction)

## 8. Frontend - Add/Edit Recipe

- [ ] 8.1 Build "Add Recipe" form (title, description, ingredients, instructions, tags)
- [ ] 8.2 Build dynamic ingredient input (add/remove rows with name, quantity, unit, notes)
- [ ] 8.3 Build dynamic instruction steps input (add/remove/reorder steps)
- [ ] 8.4 Add photo upload UI with preview
- [ ] 8.5 Add tag input with autocomplete from existing tags
- [ ] 8.6 Wire form submission to POST /api/recipes and photo upload endpoints (with auth token)
- [ ] 8.7 Build "Edit Recipe" page reusing the form component with pre-filled data

## 9. Frontend - Search

- [ ] 9.1 Wire header search bar to search results page
- [ ] 9.2 Build search results page displaying matches with thumbnails and context
- [ ] 9.3 Add empty state for no search results

## 10. Testing (target 80% code coverage)

- [ ] 10.1 Set up Jest, configure coverage thresholds at 80%
- [ ] 10.2 Unit test auth middleware (valid password, missing header, wrong password, unset ADMIN_PASSWORD)
- [ ] 10.3 Unit test ingredient normalisation logic (structured parsing, lowercase, edge cases)
- [ ] 10.4 Unit test recipe validation (required fields, missing fields, invalid data)
- [ ] 10.5 Unit test recipe CRUD API handlers (create, read, update, delete)
- [ ] 10.6 Unit test search logic (title matching, ingredient matching, empty queries)
- [ ] 10.7 Unit test photo upload validation (size limit, magic bytes, UUID filename generation)
- [ ] 10.8 Unit test tag management (creation, dedup, lowercase normalisation)
- [ ] 10.9 Unit test recently-viewed localStorage logic (add, dedup, eviction at 20)
- [ ] 10.10 Integration test: full recipe CRUD cycle against test DB with auth
- [ ] 10.11 Integration test: search returns correct results from seeded test data
- [ ] 10.12 Integration test: unauthenticated write requests return 401

## 11. Deployment (Fly.io)

- [ ] 11.1 Create Dockerfile (multi-stage build: deps, build, production)
- [ ] 11.2 Create fly.toml with volume mount for /data (SQLite DB + uploads)
- [ ] 11.3 Create .env.example with ADMIN_PASSWORD, DATABASE_URL, UPLOAD_DIR
- [ ] 11.4 Add health check endpoint: GET /api/health
- [ ] 11.5 Configure Fly.io health check in fly.toml
- [ ] 11.6 Set up production build and start scripts in package.json
- [ ] 11.7 Write deployment README: Fly.io account setup, flyctl install, fly launch, volume creation, secrets, deploy
- [ ] 11.8 Test deploy to Fly.io free tier and verify app works end-to-end

## 12. Polish & Verification

- [ ] 12.1 Test full CRUD flow end-to-end with auth (create, view, edit, delete recipe)
- [ ] 12.2 Test search by title and by ingredients
- [ ] 12.3 Test recently viewed tracking across page navigations
- [ ] 12.4 Verify responsive layout on mobile viewport sizes
- [ ] 12.5 Verify auth flow: password prompt appears, wrong password rejected, correct password works
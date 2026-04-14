## Context

This is a greenfield web application. There is no existing codebase — we're building from scratch. The primary users are contributors (people adding recipes) and readers (people browsing/searching). The app needs to be simple enough that a non-technical contributor can add a recipe quickly, and clean enough that browsing feels pleasant.

## Goals / Non-Goals

**Goals:**
- Simple, fast recipe entry flow for contributors (photos + ingredients + instructions)
- Clean, responsive frontend for browsing and searching recipes
- Standardised recipe data model that normalises how recipes are stored
- Basic search by title and ingredients
- Recently viewed tracking for easy re-access
- CMS-style backend for recipe management

**Non-Goals:**
- User accounts or multi-user authentication (shared password auth only for now)
- Advanced search features (faceted search, dietary filters, nutritional info) — deferred
- Meal planning, shopping lists, or social features
- Mobile native apps (responsive web is sufficient)
- Recipe import from external URLs or OCR from photos (future extension)

## Decisions

### 1. Tech Stack: Next.js (full-stack)

Use Next.js with App Router for both frontend and API routes. This gives us server-side rendering for fast page loads, API routes for the backend, and a single deployable unit.

**Alternatives considered:**
- Separate React SPA + Express API: more operational complexity for no real benefit at this scale.
- Static site generator (Astro/Hugo): too rigid for the CMS/search requirements.

### 2. Database: SQLite via Prisma

Start with SQLite for simplicity — zero infrastructure, file-based, easy to back up. Use Prisma as the ORM for type-safe queries and easy migrations. Can migrate to PostgreSQL later if needed without changing application code.

**Alternatives considered:**
- PostgreSQL from the start: overkill for initial scale, adds infrastructure dependency.
- JSON files: no query capability, won't support search.

### 3. Image Storage: Local filesystem with public serving

Store uploaded recipe photos on the local filesystem under a `public/uploads/` directory. Next.js serves them statically. Simple and sufficient for a personal/small-team recipe book.

**Alternatives considered:**
- Cloud storage (S3): unnecessary complexity for the initial use case.
- Database BLOBs: bad for performance and backup size.

### 4. Search: SQL LIKE queries to start

Implement title search and ingredient search using SQL LIKE/contains queries. This is adequate for hundreds of recipes. Can add full-text search (SQLite FTS5 or external search) later.

**Alternatives considered:**
- Elasticsearch/Meilisearch: heavy dependency for the initial recipe count.
- SQLite FTS5: good option to upgrade to, but LIKE is simpler to start with.

### 5. Recently Viewed: Browser localStorage

Track recently viewed recipes in the browser's localStorage. No server-side state needed, works per-device, and is trivially simple.

**Alternatives considered:**
- Server-side tracking with cookies/sessions: requires auth infrastructure we don't have yet.

### 6. Recipe Data Model

```
Recipe:
  id          - UUID
  title       - string (required)
  description - text (optional, short summary)
  ingredients - JSON array of { name, quantity, unit, notes }
  instructions - JSON array of { stepNumber, text }
  tags        - relation to Tag table (many-to-many)
  photos      - relation to Photo table (one-to-many)
  createdAt   - timestamp
  updatedAt   - timestamp

Tag:
  id   - UUID
  name - string (unique, lowercase)

Photo:
  id       - UUID
  url      - string (path to file)
  alt      - string (optional)
  recipeId - foreign key
  sortOrder - integer
```

Ingredients and instructions are stored as JSON columns for flexibility — no need to query individual ingredients at the SQL level for the initial search approach.

### 7. Basic Auth: Shared password with contributor login

A single shared password protects all write operations (create, update, delete). No user accounts, no registration — just one password that all contributors know.

**Mechanism:**
- `ADMIN_PASSWORD` environment variable set on the deployment platform (never in code or committed files)
- API write endpoints (POST, PUT, DELETE) check the `Authorization: Bearer <password>` header
- Comparison uses constant-time string comparison to prevent timing attacks
- If `ADMIN_PASSWORD` is not set, the app refuses all write requests (fail-closed)
- GET endpoints remain fully public — no auth needed to browse or search

**Frontend flow:**
- The app has two modes: **reader** (default) and **contributor** (authenticated)
- In reader mode, write CTAs (Add Recipe, Edit, Delete) are hidden. A "Contributor login" link appears in the header.
- Tapping "Contributor login" opens the auth modal (password prompt)
- After successful authentication, password is stored in `sessionStorage` (cleared when tab closes)
- In contributor mode: header shows a "Contributor" indicator with "Logout" option, and write CTAs appear on all pages (Add Recipe FAB on homepage, Edit/Delete on recipe detail)
- All write requests automatically attach the password as a Bearer token
- If a 401 is returned (wrong/expired password), the auth modal reappears and the app reverts to reader mode
- Logout clears sessionStorage and reverts to reader mode

**First deploy:**
- Admin sets the password via platform secrets: `fly secrets set ADMIN_PASSWORD=<chosen-password>`
- No default password exists — the admin chooses one during setup
- Password can be changed at any time by updating the secret and restarting

**Alternatives considered:**
- Per-action auth modal (prompt on each write action): more friction, confusing UX — contributor has to authenticate repeatedly or encounter surprise modals.
- Toggle switch for read/write mode: implies persistent state, confusing for casual users.
- HTTP Basic Auth (browser-native prompt): works but the UX is poor and can't be styled.
- JWT/session-based auth: overkill for a single shared credential.
- OAuth/social login: way too complex for this use case.

## Risks / Trade-offs

- **SQLite concurrency**: SQLite handles one writer at a time. Fine for low-traffic personal use, but would need migration to PostgreSQL if concurrent writes become an issue. -> Mitigation: Prisma makes DB swaps straightforward.
- **Shared password auth**: A single password shared among contributors. If compromised, all write access is exposed. -> Mitigation: Password can be rotated instantly via `fly secrets set`. Acceptable for family/small-team use. Can upgrade to per-user accounts later.
- **Local image storage**: Not suitable for multi-server deployment. -> Mitigation: Single-server deployment is fine for the initial scope. Fly.io volumes are single-node. Cloud storage migration is a contained change.
- **LIKE-based search**: Poor performance at scale, no relevance ranking. -> Mitigation: Sufficient for hundreds of recipes. FTS5 upgrade path is clear.

## Deployment Plan

### Platform: Fly.io (free tier)

Fly.io is the simplest platform that supports the current architecture (SQLite + local filesystem). It provides persistent volumes, Docker-based deployment, free HTTPS, and custom domains.

**Why Fly.io over alternatives:**
- Vercel: serverless — no persistent filesystem, so SQLite and local file uploads won't work without switching to hosted DB + cloud storage.
- Railway: similar to Fly.io but no meaningful free tier (/mo minimum).
- VPS (DigitalOcean/Hetzner): cheapest long-term but more manual setup.

**Free tier includes:**
- 3 shared-cpu VMs (1 is enough)
- 1GB persistent volumes
- Shared IPv4, dedicated IPv6
- Automatic HTTPS with Let's Encrypt

### Account Setup Instructions

1. **Create a Fly.io account**: Go to fly.io and sign up (email or GitHub)
2. **Install the CLI**: `brew install flyctl` (macOS) or `curl -L https://fly.io/install.sh | sh`
3. **Authenticate**: `fly auth login` (opens browser)
4. **Launch the app** (from the project root):
   ```bash
   fly launch
   ```
   This detects the Dockerfile, creates the app, and generates `fly.toml`.
5. **Create persistent volumes**:
   ```bash
   fly volumes create data --size 1 --region lhr
   ```
6. **Set secrets**:
   ```bash
   fly secrets set ADMIN_PASSWORD=<your-chosen-password>
   fly secrets set DATABASE_URL=file:/data/recipes.db
   fly secrets set UPLOAD_DIR=/data/uploads
   ```
7. **Mount the volume** in `fly.toml`:
   ```toml
   [mounts]
     source = "data"
     destination = "/data"
   ```
8. **Deploy**: `fly deploy`
9. **Verify**: `fly open` (opens the app in browser)

### Container Strategy
Multi-stage Dockerfile:
1. **deps stage**: Install node_modules
2. **build stage**: Run Next.js build, generate Prisma client
3. **production stage**: Minimal Node.js image with only production artifacts

### Persistence
- SQLite database file on Fly.io persistent volume at `/data/recipes.db`
- Uploads directory on the same volume at `/data/uploads`
- Volume survives deploys and restarts

### Environment Variables
- `ADMIN_PASSWORD`: Shared password for write access (required, no default)
- `DATABASE_URL`: Path to SQLite file (default: `file:/data/recipes.db`)
- `UPLOAD_DIR`: Path to uploads directory (default: `/data/uploads`)
- `NODE_ENV`: production

### Health Check
- `GET /api/health` returns 200 with DB connectivity status
- Fly.io health checks configured in `fly.toml`

### Rollback
- `fly releases` lists previous deployments
- `fly deploy --image <previous-image>` rolls back
- SQLite DB is on the volume and is not affected by rollbacks

### Backup
- Use `fly ssh console` + `sqlite3 /data/recipes.db .dump > backup.sql` for manual backups
- Set up a scheduled Fly Machine or external cron to automate daily backups
- Uploads directory can be tarred and downloaded via `fly sftp`

### Custom Domain (optional)
1. `fly certs add yourdomain.com`
2. Add CNAME record pointing to `<app-name>.fly.dev`
3. Fly.io provisions HTTPS automatically

## Testing Strategy

### Coverage Target
80% code coverage, predominantly unit tests.

### Test Pyramid
- **Unit tests (majority)**: Business logic — ingredient parsing, validation, normalisation, search matching, recently-viewed logic, auth middleware. Pure functions, fast, no I/O.
- **Component tests**: no need for component tests
- **Integration tests (few)**: Full API request cycle against a test SQLite DB. Verify CRUD, search, and auth end-to-end.

### Tooling
- Jest as test runner with coverage reporting
- Prisma with a test SQLite DB for integration tests (reset between test suites)
- Coverage threshold enforced in CI: fail build if below 80%

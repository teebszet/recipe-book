# Recipe Book

A personal recipe collection app built with Next.js, Prisma, and SQLite.

## Local Development

```bash
cp .env.example .env
# Set ADMIN_PASSWORD in .env

npm install
npx prisma generate
npx prisma db push
npm run dev
```

Visit `http://localhost:3000`. To add/edit/delete recipes, click "Contributor login" in the header and enter your `ADMIN_PASSWORD`.

## Testing

```bash
npm test              # run tests
npm test -- --coverage # run with coverage report
```

Coverage thresholds are set to 80% for branches, functions, lines, and statements.

## Deploy to Fly.io

### Prerequisites

- [Fly.io account](https://fly.io)
- [flyctl CLI](https://fly.io/docs/flyctl/install/)

### Steps

1. **Authenticate with Fly.io:**

   ```bash
   fly auth login
   ```

2. **Launch the app** (first time only):

   ```bash
   fly launch --no-deploy
   ```

   This creates the app on Fly.io. Review `fly.toml` — it's pre-configured with `lhr` region, health checks, and auto-stop.

3. **Create a persistent volume** for the SQLite database and uploaded photos:

   ```bash
   fly volumes create data --region lhr --size 1
   ```

4. **Set secrets:**

   ```bash
   fly secrets set ADMIN_PASSWORD="your-secure-password"
   fly secrets set DATABASE_URL="file:/data/recipe-book.db"
   fly secrets set UPLOAD_DIR="/data/uploads"
   ```

5. **Deploy:**

   ```bash
   fly deploy
   ```

6. **Run the initial database migration** (first deploy only):

   ```bash
   fly ssh console -C "npx prisma db push --schema ./prisma/schema.prisma"
   ```

7. **Verify** the app is running:

   ```bash
   fly status
   fly open
   ```

   The health check endpoint at `/api/health` confirms database connectivity.

### Updating

After code changes, redeploy with:

```bash
fly deploy
```

The SQLite database and uploads persist on the mounted volume at `/data`.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `ADMIN_PASSWORD` | Password for contributor access (required for write operations) | — |
| `DATABASE_URL` | SQLite database path | `file:./prisma/dev.db` |
| `UPLOAD_DIR` | Directory for uploaded photos | `public/uploads` |

// Lightweight migration script - runs raw SQL via better-sqlite3
// No Prisma CLI needed, uses ~5MB memory vs ~200MB+ for prisma db push
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const dbPath = dbUrl.replace('file:', '');

// Ensure parent directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Track applied migrations in a simple table
db.exec(`CREATE TABLE IF NOT EXISTS _applied_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))`);

const migrations = [
  { name: '20260415014219_init', file: 'prisma/migrations/20260415014219_init/migration.sql' },
  { name: '20260429000000_photo_optional_recipe', file: 'prisma/migrations/20260429000000_photo_optional_recipe/migration.sql' },
];

const getApplied = db.prepare("SELECT name FROM _applied_migrations WHERE name = ?");
const markApplied = db.prepare("INSERT INTO _applied_migrations (name) VALUES (?)");

for (const migration of migrations) {
  if (getApplied.get(migration.name)) {
    console.log(`Migration ${migration.name} already applied`);
    continue;
  }
  console.log(`Applying migration ${migration.name}...`);
  const sql = fs.readFileSync(path.join(__dirname, migration.file), 'utf-8');
  db.exec(sql);
  markApplied.run(migration.name);
  console.log(`Applied ${migration.name}`);
}

db.close();

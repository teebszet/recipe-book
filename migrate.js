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

// Check if tables already exist
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='Recipe'").get();
if (tables) {
  console.log('Database already migrated');
  db.close();
  process.exit(0);
}

console.log('Running initial migration...');
const sql = fs.readFileSync(path.join(__dirname, 'prisma/migrations/20260415014219_init/migration.sql'), 'utf-8');
db.exec(sql);
console.log('Migration complete');
db.close();

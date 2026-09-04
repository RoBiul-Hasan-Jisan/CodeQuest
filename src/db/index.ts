import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'fs';
import path from 'path';
import * as schema from './schema';

function resolveDataDir() {
  const envDir = process.env.DATA_DIR;
  if (envDir) return envDir;
  const candidate = '/tmp/codequest';
  try {
    fs.mkdirSync(candidate, { recursive: true });
    return candidate;
  } catch {
    return path.join(process.cwd(), 'data');
  }
}

const dataDir = resolveDataDir();
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'codequest.db');

declare global {
  // eslint-disable-next-line no-var
  var __codequest_sqlite__: Database.Database | undefined;
}

const sqlite = global.__codequest_sqlite__ ?? new Database(dbPath);
if (process.env.NODE_ENV !== 'production') global.__codequest_sqlite__ = sqlite;

sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// ── Schema bootstrap (idempotent) ──────────────────────────────────────────
sqlite.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (current_timestamp),
  last_login TEXT
);
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  due_date TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  created_at TEXT NOT NULL DEFAULT (current_timestamp),
  completed_at TEXT
);
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  color TEXT NOT NULL DEFAULT '#6366f1',
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (current_timestamp)
);
CREATE TABLE IF NOT EXISTS progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  progress_date TEXT NOT NULL,
  problems_solved INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS progress_user_date_idx ON progress (user_id, progress_date);
CREATE TABLE IF NOT EXISTS leetcode_problems (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  tags TEXT,
  difficulty TEXT NOT NULL,
  solved INTEGER NOT NULL DEFAULT 0,
  url TEXT,
  solved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (current_timestamp)
);
CREATE TABLE IF NOT EXISTS friendships (
  id TEXT PRIMARY KEY,
  from_username TEXT NOT NULL,
  to_username TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL DEFAULT (current_timestamp)
);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_username TEXT NOT NULL,
  receiver_username TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT (current_timestamp),
  read_at TEXT
);
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  instructor TEXT,
  image_path TEXT,
  created_at TEXT NOT NULL DEFAULT (current_timestamp)
);
CREATE UNIQUE INDEX IF NOT EXISTS courses_user_code_idx ON courses (user_id, code);
CREATE TABLE IF NOT EXISTS course_items (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  type TEXT NOT NULL,
  text TEXT,
  name TEXT,
  link TEXT,
  title TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (current_timestamp)
);
`);

export default db;

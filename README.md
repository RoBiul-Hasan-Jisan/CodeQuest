# CodeQuest

A full-stack study companion for coding students — tasks, LeetCode practice tracking,
project deadlines, a progress heatmap, a Pomodoro focus timer, a course workspace
(notes/resources/slides/tasks), friends, and direct messaging. Rebuilt in Next.js
from the original JavaFX + Java HTTP server desktop app.

Author: **Robiul Hasan Jisan**

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind CSS v4)
- **Drizzle ORM** + **better-sqlite3** for storage (chosen over Prisma — no external
  binary engine download required, so it works in fully offline/sandboxed environments too)
- **jose** + **bcryptjs** for JWT auth in an httpOnly cookie
- All backend logic lives in Next.js Route Handlers under `src/app/api/**`

## Getting started

```bash
npm install
npm run dev
```

Visit http://localhost:3000. Create an account on the signup page — there's no
seed data.

### Environment variables (`.env`)

```
DATABASE_URL="file:./dev.db"   # unused by the sqlite driver directly, kept for reference
JWT_SECRET="replace-with-a-long-random-string-in-production"
DATA_DIR="/absolute/path/to/writable/dir"   # optional; defaults to /tmp/codequest, falls back to ./data
```

Set a strong, unique `JWT_SECRET` before deploying.

## Project structure

```
src/
  app/
    (app)/            # authenticated app shell: dashboard, tasks, calendar,
                       # leetcode, progress, pomodoro, courses, friends, messages
    api/               # REST-style route handlers (one folder per resource)
    login/ signup/     # auth pages
    page.tsx           # public landing page
  components/          # shared UI primitives + AppShell sidebar
  db/                  # Drizzle schema + sqlite connection/bootstrap
  lib/                 # auth helpers, api client, shared types
```

## Data model

SQLite tables (see `src/db/schema.ts`): `users`, `tasks`, `projects`, `progress`,
`leetcode_problems`, `friendships`, `messages`, `courses`, `course_items`.
Tables are created automatically on first run (no migration step needed for local dev).

## Notes on the conversion

- Friend/message relationships are keyed by **username** (matching the original
  Java app's model) rather than foreign-key IDs, to keep the friend-request and
  DM logic a close match to the source behavior.
- The Pomodoro timer is fully client-side (no persistence), matching the original's
  simple session countdown.
- Course items (notes/resources/slides/tasks) share one `course_items` table
  distinguished by a `type` column, mirroring the original's four-panel course workspace.

# CodeQuest

A full-stack study companion for coding students, combining task management,
LeetCode practice tracking, project deadlines, a progress heatmap, a Pomodoro
focus timer, a course workspace, friends, and direct messaging — all in one app.

Originally built as a JavaFX + Java HTTP server desktop application, CodeQuest
has been rebuilt from the ground up as a modern Next.js web app.

**Author:** Robiul Hasan Jisan

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Design Notes: JavaFX → Next.js](#design-notes-javafx--nextjs)
- [License](#license)

---

## Features

| Module | Description |
|---|---|
| **Dashboard** | At-a-glance overview of tasks, deadlines, and study progress |
| **Tasks** | Create, organize, and track coursework and personal to-dos |
| **Calendar** | Visualize project deadlines and scheduled work over time |
| **LeetCode Tracker** | Log solved problems and monitor practice consistency |
| **Progress Heatmap** | GitHub-style activity heatmap of daily study effort |
| **Pomodoro Timer** | Client-side focus timer for distraction-free study sessions |
| **Course Workspace** | Per-course hub for notes, resources, slides, and tasks |
| **Friends** | Send/accept friend requests to connect with classmates |
| **Messages** | Direct messaging between friends |

## Tech Stack

- **[Next.js 15](https://nextjs.org/)** — App Router, TypeScript, Tailwind CSS v4
- **[Drizzle ORM](https://orm.drizzle.team/)** + **better-sqlite3** — lightweight,
  file-based storage with no external binary engine required, making the app easy
  to run in fully offline or sandboxed environments
- **[jose](https://github.com/panva/jose)** + **bcryptjs** — JWT-based authentication
  stored in an `httpOnly` cookie
- **Next.js Route Handlers** — all backend/API logic lives under `src/app/api/**`,
  keeping the project a single deployable unit

## Getting Started

### Prerequisites

- Node.js 18.18+ (or any version supported by Next.js 15)
- npm

### Installation

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

There is no seed data — create an account from the signup page to get started.

## Environment Variables

Create a `.env` file in the project root:

```env
# Unused directly by the sqlite driver; kept for reference/tooling compatibility
DATABASE_URL="file:./dev.db"

# Required in production — use a long, random, unique value
JWT_SECRET="replace-with-a-long-random-string-in-production"

# Optional. Defaults to /tmp/codequest, falling back to ./data if unwritable
DATA_DIR="/absolute/path/to/writable/dir"
```

>  **Security note:** Always set a strong, unique `JWT_SECRET` before deploying
> to any environment beyond local development.

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated app shell — dashboard, tasks, calendar,
│   │                   # leetcode, progress, pomodoro, courses, friends, messages
│   ├── api/             # REST-style route handlers, one folder per resource
│   ├── login/           # Auth pages
│   ├── signup/
│   └── page.tsx         # Public landing page
├── components/          # Shared UI primitives and the AppShell sidebar
├── db/                  # Drizzle schema and SQLite connection/bootstrap logic
└── lib/                 # Auth helpers, API client, shared types
```

## Data Model

The app is backed by SQLite tables defined in `src/db/schema.ts`:

`users` · `tasks` · `projects` · `progress` · `leetcode_problems` ·
`friendships` · `messages` · `courses` · `course_items`

Tables are created automatically on first run — no migration step is required
for local development.

## Design Notes: JavaFX → Next.js

A few implementation choices preserve behavior from the original desktop app:

- **Username-keyed relationships** — Friend and message relationships are keyed
  by **username** rather than foreign-key IDs, matching the original Java
  application's model and keeping the friend-request and DM logic a close
  match to the source behavior.
- **Client-only Pomodoro timer** — The focus timer has no persistence layer,
  mirroring the original's simple session countdown.
- **Unified course items table** — Notes, resources, slides, and tasks within a
  course share a single `course_items` table distinguished by a `type` column,
  mirroring the original's four-panel course workspace.
- **Drizzle over Prisma** — Drizzle + better-sqlite3 was chosen specifically
  because it requires no external binary engine download, so the app runs
  reliably in fully offline or sandboxed environments.


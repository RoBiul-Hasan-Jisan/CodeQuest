<div align="center">

#  CodeQuest

**An all-in-one study companion for coding students.**

Tasks · LeetCode tracking · deadlines · progress heatmap · Pomodoro timer ·
course workspace · friends · direct messaging

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-SQLite-c5f74f)](https://orm.drizzle.team/)
[![License](https://img.shields.io/badge/license-unspecified-lightgrey)](#license)

[Repository](https://github.com/RoBiul-Hasan-Jisan/CodeQuest) · [Report a bug](https://github.com/RoBiul-Hasan-Jisan/CodeQuest/issues) · [Request a feature](https://github.com/RoBiul-Hasan-Jisan/CodeQuest/issues)

</div>

---

## Overview

CodeQuest helps coding students stay organized and consistent — in one place,
instead of scattered across a to-do app, a spreadsheet, and a LeetCode profile.
It combines coursework tracking, interview-prep logging, focused study sessions,
and light social features (friends + DMs) into a single web app.

The project was originally a **JavaFX + Java HTTP server** desktop application,
and has since been rebuilt as a modern, self-hostable **Next.js** web app with
the same core feature set and behavior.

## Features

| Module | Description |
|---|---|
|   **Dashboard** | At-a-glance overview of tasks, deadlines, and study progress |
|   **Tasks** | Create, organize, and track coursework and personal to-dos |
|   **Calendar** | Visualize project deadlines and scheduled work over time |
|   **LeetCode Tracker** | Log solved problems and monitor practice consistency |
|   **Progress Heatmap** | GitHub-style activity heatmap of daily study effort |
|   **Pomodoro Timer** | Client-side focus timer for distraction-free study sessions |
|   **Course Workspace** | Per-course hub for notes, resources, slides, and tasks |
|   **Friends** | Send and accept friend requests to connect with classmates |
|   **Messages** | Direct messaging between friends |

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, TypeScript) | Single deployable unit for both frontend and backend |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) | Fast, utility-first styling with no separate CSS build step |
| Database | SQLite via [Drizzle ORM](https://orm.drizzle.team/) + `better-sqlite3` | No external binary engine to download — runs reliably in offline/sandboxed environments, unlike Prisma |
| Auth | [`jose`](https://github.com/panva/jose) (JWT) + `bcryptjs` (password hashing) | Stateless sessions via a signed, `httpOnly` cookie |
| API | Next.js Route Handlers under `src/app/api/**` | REST-style endpoints colocated with the rest of the app |

## Getting Started

### Prerequisites

- **Node.js** 18.18 or later
- **npm**

### Installation

```bash
git clone https://github.com/RoBiul-Hasan-Jisan/CodeQuest.git
cd CodeQuest
npm install
npm run dev
```

Then open **[http://localhost:3000](http://localhost:3000)**.

There's no seed data — sign up for a new account from the signup page to start
using the app.

### Building for production

```bash
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure the following:

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` |   Yes | Secret used to sign auth tokens. Must be a long, random, unique string in production. |
| `DATA_DIR` |   No | Absolute path to a writable directory for the SQLite database file. Defaults to `/tmp/codequest`, falling back to `./data` if that isn't writable. |
| `DATABASE_URL` |   No | Not read directly by the SQLite driver; kept for reference and tooling compatibility. |

```env
JWT_SECRET="replace-with-a-long-random-string-in-production"
DATA_DIR="/absolute/path/to/writable/dir"
DATABASE_URL="file:./dev.db"
```

>  **Security note:** Never deploy with the default/example `JWT_SECRET`.
> Generate one with, e.g., `openssl rand -base64 32`.

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

The app is backed by SQLite, with the schema defined in `src/db/schema.ts`:

- **`users`** — accounts and credentials
- **`tasks`** — coursework and personal to-dos
- **`projects`** — project deadlines shown on the calendar
- **`progress`** — daily activity records powering the progress heatmap
- **`leetcode_problems`** — logged practice problems
- **`friendships`** — friend requests and connections (keyed by username)
- **`messages`** — direct messages between friends (keyed by username)
- **`courses`** — course workspaces
- **`course_items`** — notes, resources, slides, and tasks belonging to a course

Tables are created automatically on first run — there is no manual migration
step for local development.

## Design Notes: JavaFX → Next.js

A few implementation choices intentionally preserve behavior from the original
desktop application, rather than "modernizing" the data model outright:

- **Username-keyed relationships** — friend and message relationships are keyed
  by **username** rather than numeric foreign keys, matching the original Java
  application's model so the friend-request and DM logic stays a close match
  to the source behavior.
- **Client-only Pomodoro timer** — the focus timer has no server-side
  persistence, mirroring the original's simple session countdown.
- **Unified course items table** — notes, resources, slides, and tasks within a
  course share a single `course_items` table distinguished by a `type` column,
  mirroring the original four-panel course workspace.
- **Drizzle over Prisma** — chosen specifically because it needs no external
  binary engine download, so the app runs reliably in fully offline or
  sandboxed environments.

## Roadmap

Ideas for future iterations:

- [ ] Persist Pomodoro sessions for historical stats
- [ ] Course item file uploads (attachments for resources/slides)
- [ ] Notifications for upcoming deadlines
- [ ] Automated tests for API route handlers

Contributions and suggestions are welcome — feel free to open an issue.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request


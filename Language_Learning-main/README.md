# Language Learning — AI-Powered English Practice

> Master English with AI-powered vocabulary, grammar quizzes, speaking practice, writing assistance, and a personal AI tutor.

**Live demo:** [language-learning-rosy-six.vercel.app](https://language-learning-rosy-six.vercel.app)

---

## Overview

Language Learning is a full-stack web application that helps learners improve their English through six AI-powered practice modules. Every exercise is generated and evaluated by Google Gemini AI, giving instant, personalised feedback on every answer.

---

## Features

### Core Modules

| Module | Description |
|--------|-------------|
| **Vocabulary Builder** | Add words, review with flashcards, track mastery with spaced-repetition stats |
| **Grammar Lab** | 18 grammar categories — AI generates unique questions at your exact level |
| **Speaking Practice** | Record yourself, receive instant AI feedback on clarity, fluency, and vocabulary |
| **Writing Assistant** | Paste any text — AI fixes grammar, rewrites tone, and suggests vocabulary upgrades |
| **AI Tutor (Aria)** | 24/7 conversational tutor — ask anything, get explanations tailored to your level |
| **Progress & Analytics** | XP system, level progression, streaks, heatmaps, accuracy charts, and weekly reports |

### Additional Pages

- **Dashboard** — overview of all activity, daily goals, and quick-launch cards
- **Lessons** — structured learning tracks (vocabulary, grammar, speaking, writing, tutor)
- **Achievements** — 16 badges across 7 categories, earned from real learning data
- **Certificates** — earn CEFR-level certificates (A1 → C1) by hitting milestones; download as PDF
- **Settings** — profile, daily goal, theme (light/dark/system), notification preferences

### Auth

- Email / password registration and login
- Google OAuth (one-click sign-in)
- Forgot password / reset email
- Session state synced via Firebase Auth + Zustand

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + Radix UI primitives |
| Animation | Framer Motion |
| Charts | Recharts |
| State | Zustand 5 (with localStorage persistence) |
| Server state | TanStack Query v5 |
| AI | Google Gemini (`@google/generative-ai`) |
| Auth & DB | Firebase 11 (Auth + Firestore) |
| Hosting | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register, forgot-password
│   ├── (dashboard)/     # All authenticated pages
│   │   ├── dashboard/
│   │   ├── vocabulary/
│   │   ├── grammar/
│   │   ├── speaking/
│   │   ├── writing/
│   │   ├── tutor/
│   │   ├── progress/
│   │   ├── lessons/
│   │   ├── achievements/
│   │   ├── certificates/
│   │   └── settings/
│   └── api/             # Route handlers (Gemini AI endpoints)
│
├── features/            # Domain-driven feature modules
│   ├── auth/
│   ├── analytics/
│   ├── grammar/
│   ├── vocabulary/
│   ├── speaking/
│   ├── writing/
│   ├── tutor/
│   ├── progress/
│   ├── streak/
│   └── lessons/
│
├── components/
│   ├── layout/          # Header, Sidebar, MobileDrawer
│   └── ui/              # Button, Card, Badge, Skeleton, etc.
│
├── providers/           # ThemeProvider, QueryProvider, AuthSync
├── lib/                 # Firebase config, utils, rate-limit
└── config/              # Navigation config, constants
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Firebase](https://console.firebase.google.com) project with **Authentication** enabled
- A [Google AI Studio](https://aistudio.google.com) API key for Gemini

### 1. Clone and install

```bash
git clone https://github.com/A-K-M-Asifuzzaman/Language_Learning.git
cd Language_Learning
npm install
```

### 2. Set up environment variables

Create a `.env.local` file at the project root:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini AI
GEMINI_API_KEY=your_gemini_key
```

### 3. Enable Firebase Auth providers

In the Firebase Console → Authentication → Sign-in method, enable:
- **Email/Password**
- **Google**

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint errors
npm run type-check   # Run TypeScript type checking
npm run test         # Run all tests (Vitest)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

---

## Deployment

The app is deployed to Vercel. To deploy your own instance:

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` in **Project Settings → Environment Variables**
4. Deploy — Vercel auto-deploys on every push to `main`

---

## Certificates

Users can earn CEFR-level certificates by hitting milestones across all learning modules:

| Certificate | Requirements |
|-------------|-------------|
| **A1 Foundation** | 100 XP · 10 vocabulary words · 1 grammar topic |
| **A2 Elementary** | Level 5 · 500 XP · 50 words · 3 grammar topics |
| **B1 Intermediate** | Level 10 · 1,500 XP · 50 mastered words · 6 topics · 7-day streak |
| **B2 Upper Intermediate** | Level 20 · 4,000 XP · 150 mastered words · 10 topics · 30-day streak · 80% grammar score |
| **C1 Advanced** | Level 30 · 8,000 XP · 300 mastered words · 15 topics · 60-day streak · 90% grammar score |

Certificates can be previewed at any time and downloaded as PDF once earned.

---

## License

MIT — free to use for personal and educational projects.

---

Built with Next.js 15 · Google Gemini AI · Firebase · Tailwind CSS

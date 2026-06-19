import type { FieldValue, Timestamp } from "firebase/firestore";

// ─── Firestore document base ─────────────────────────────────────────────────

export interface FirestoreBase {
  id: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

// ─── User document ───────────────────────────────────────────────────────────

export interface UserDocument extends FirestoreBase {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  preferences: UserPreferences;
}

export type UserRole = "student" | "admin";

export interface UserPreferences {
  locale: string;
  dailyGoalMinutes: number;
  notifications: boolean;
}

// ─── Lesson document ─────────────────────────────────────────────────────────

export interface LessonDocument extends FirestoreBase {
  title: string;
  description: string;
  language: string;
  level: DifficultyLevel;
  durationMinutes: number;
  published: boolean;
  tags: string[];
}

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

// ─── Progress document ───────────────────────────────────────────────────────

export interface ProgressDocument extends FirestoreBase {
  userId: string;
  lessonId: string;
  completedAt: Timestamp | null;
  score: number;
  timeSpentSeconds: number;
}

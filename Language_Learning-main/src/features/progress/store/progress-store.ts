import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import {
  computeLevelInfo,
  type CourseProgressInput,
  type LessonProgress,
  type ProgressState,
  type XPSource,
} from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();

const XP_LOG_MAX = 200;

// ─── Initial state ────────────────────────────────────────────────────────────

const initialProgressState: Omit<
  ProgressState,
  | "earnXP"
  | "enrollCourse"
  | "setCurrentLesson"
  | "completeLesson"
  | "resetCourse"
  | "resetAll"
> = {
  totalXP: 0,
  levelInfo: computeLevelInfo(0),
  courses: {},
  lessons: {},
  xpLog: [],
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProgressStore = create<ProgressState>()(
  devtools(
    persist(
      (set, _get) => ({
        ...initialProgressState,

        // ── earnXP ────────────────────────────────────────────────────────
        earnXP: (amount: number, source: XPSource, meta?: string) => {
          if (amount <= 0) return;
          set((state) => {
            const totalXP = state.totalXP + amount;
            const xpLog = [
              { amount, source, earnedAt: now(), ...(meta ? { meta } : {}) },
              ...state.xpLog,
            ].slice(0, XP_LOG_MAX);

            return {
              totalXP,
              levelInfo: computeLevelInfo(totalXP),
              xpLog,
            };
          });
        },

        // ── enrollCourse ──────────────────────────────────────────────────
        enrollCourse: (course: CourseProgressInput) => {
          set((state) => {
            if (state.courses[course.courseId]) return state; // already enrolled
            return {
              courses: {
                ...state.courses,
                [course.courseId]: {
                  ...course,
                  completedLessonIds: [],
                  xpEarned: 0,
                  currentLessonId: null,
                  enrolledAt: now(),
                  lastAccessedAt: now(),
                },
              },
            };
          });
        },

        // ── setCurrentLesson ──────────────────────────────────────────────
        setCurrentLesson: (courseId: string, lessonId: string) => {
          set((state) => {
            const course = state.courses[courseId];
            if (!course) return state;
            return {
              courses: {
                ...state.courses,
                [courseId]: {
                  ...course,
                  currentLessonId: lessonId,
                  lastAccessedAt: now(),
                },
              },
            };
          });
        },

        // ── completeLesson ────────────────────────────────────────────────
        completeLesson: (
          lessonId: string,
          courseId: string,
          score: number,
          timeSpentSeconds: number,
          xpReward: number
        ) => {
          set((state) => {
            const course = state.courses[courseId];
            const existingLesson: LessonProgress | undefined = state.lessons[lessonId];

            const isFirstCompletion = !existingLesson?.completed;
            const bestScore = Math.max(existingLesson?.bestScore ?? 0, score);
            const totalTime = (existingLesson?.timeSpentSeconds ?? 0) + timeSpentSeconds;

            const updatedLesson: LessonProgress = {
              lessonId,
              courseId,
              completed: true,
              score,
              bestScore,
              attempts: (existingLesson?.attempts ?? 0) + 1,
              completedAt: existingLesson?.completedAt ?? now(),
              timeSpentSeconds: totalTime,
            };

            const updatedCourse = course
              ? {
                  ...course,
                  completedLessonIds: isFirstCompletion
                    ? [...new Set([...course.completedLessonIds, lessonId])]
                    : course.completedLessonIds,
                  xpEarned: course.xpEarned + (isFirstCompletion ? xpReward : 0),
                  lastAccessedAt: now(),
                }
              : undefined;

            const totalXP = isFirstCompletion
              ? state.totalXP + xpReward
              : state.totalXP;

            const xpLog = isFirstCompletion
              ? [
                  { amount: xpReward, source: "lesson_complete" as XPSource, earnedAt: now() },
                  ...state.xpLog,
                ].slice(0, XP_LOG_MAX)
              : state.xpLog;

            return {
              totalXP,
              levelInfo: computeLevelInfo(totalXP),
              xpLog,
              lessons: { ...state.lessons, [lessonId]: updatedLesson },
              courses: updatedCourse
                ? { ...state.courses, [courseId]: updatedCourse }
                : state.courses,
            };
          });
        },

        // ── resetCourse ───────────────────────────────────────────────────
        resetCourse: (courseId: string) => {
          set((state) => {
            const course = state.courses[courseId];
            if (!course) return state;

            // Remove lessons belonging to this course
            const lessons = Object.fromEntries(
              Object.entries(state.lessons).filter(
                ([, lesson]) => lesson.courseId !== courseId
              )
            );

            return {
              courses: {
                ...state.courses,
                [courseId]: {
                  ...course,
                  completedLessonIds: [],
                  xpEarned: 0,
                  currentLessonId: null,
                  lastAccessedAt: now(),
                },
              },
              lessons,
            };
          });
        },

        // ── resetAll ──────────────────────────────────────────────────────
        resetAll: () => set({ ...initialProgressState }),
      }),
      {
        name: "ll:progress",
        version: 1,
        // Rehydrate computed levelInfo from persisted totalXP
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.levelInfo = computeLevelInfo(state.totalXP);
          }
        },
        partialize: ({ totalXP, courses, lessons, xpLog }) => ({
          totalXP,
          courses,
          lessons,
          xpLog,
        }),
      }
    ),
    { name: "ProgressStore" }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectTotalXP = (s: ProgressState) => s.totalXP;
export const selectLevelInfo = (s: ProgressState) => s.levelInfo;
export const selectCourse = (courseId: string) => (s: ProgressState) =>
  s.courses[courseId] ?? null;
export const selectLesson = (lessonId: string) => (s: ProgressState) =>
  s.lessons[lessonId] ?? null;
export const selectCourseList = (s: ProgressState) => Object.values(s.courses);
export const selectCompletedCourses = (s: ProgressState) =>
  Object.values(s.courses).filter(
    (c) => c.completedLessonIds.length >= c.totalLessons && c.totalLessons > 0
  );
export const selectRecentXPEvents = (limit = 10) => (s: ProgressState) =>
  s.xpLog.slice(0, limit);

"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";


import type { RecallQuality } from "@/features/vocabulary/types";
import { QUERY_STALE_TIME } from "@/lib/constants";
import { progressKeys } from "@/lib/firebase/query-keys";

import { progressService } from "../services/progress-service";
import type {
  LessonProgressDoc,
  QuizProgressDoc,
  RecordLessonInput,
  RecordQuizInput,
  UserProgressSummary,
  VocabProgressDoc,
} from "../types/firestore";


/* ============================================================================
   Progress hooks
   ============================================================================ */

// ─── Query hooks ──────────────────────────────────────────────────────────────

/** Aggregated stats summary for the current user. */
export function useProgressStats(
  userId: string | undefined
): UseQueryResult<UserProgressSummary | null> {
  return useQuery({
    queryKey: progressKeys.stats(userId ?? ""),
    queryFn: () => progressService.getUserStats(userId!),
    enabled: !!userId,
    staleTime: QUERY_STALE_TIME,
  });
}

/** Progress record for a single lesson. */
export function useLessonProgress(
  userId: string | undefined,
  lessonId: string | undefined
): UseQueryResult<LessonProgressDoc | null> {
  return useQuery({
    queryKey: progressKeys.lesson(userId ?? "", lessonId ?? ""),
    queryFn: () => progressService.getLessonProgress(userId!, lessonId!),
    enabled: !!userId && !!lessonId,
    staleTime: QUERY_STALE_TIME,
  });
}

/** All lesson progress records for a user (for dashboard overviews). */
export function useAllLessonProgress(
  userId: string | undefined
): UseQueryResult<LessonProgressDoc[]> {
  return useQuery({
    queryKey: progressKeys.lessons(userId ?? ""),
    queryFn: () => progressService.getAllLessonProgress(userId!),
    enabled: !!userId,
    staleTime: QUERY_STALE_TIME,
  });
}

/** Progress record for a single vocabulary word. */
export function useVocabProgress(
  userId: string | undefined,
  wordId: string | undefined
): UseQueryResult<VocabProgressDoc | null> {
  return useQuery({
    queryKey: progressKeys.vocabularyWord(userId ?? "", wordId ?? ""),
    queryFn: () => progressService.getVocabProgress(userId!, wordId!),
    enabled: !!userId && !!wordId,
    staleTime: QUERY_STALE_TIME,
  });
}

/** All vocabulary words due for review today. */
export function useDueVocab(
  userId: string | undefined,
  today: string
): UseQueryResult<VocabProgressDoc[]> {
  return useQuery({
    queryKey: progressKeys.vocabularyDue(userId ?? ""),
    queryFn: () => progressService.getDueWords(userId!, today),
    enabled: !!userId,
    staleTime: 0, // Always fresh — due list changes as reviews complete
  });
}

/** Progress record for a single quiz. */
export function useQuizProgress(
  userId: string | undefined,
  quizId: string | undefined
): UseQueryResult<QuizProgressDoc | null> {
  return useQuery({
    queryKey: progressKeys.quiz(userId ?? "", quizId ?? ""),
    queryFn: () => progressService.getQuizProgress(userId!, quizId!),
    enabled: !!userId && !!quizId,
    staleTime: QUERY_STALE_TIME,
  });
}

/** All quiz progress records for a user. */
export function useAllQuizProgress(
  userId: string | undefined
): UseQueryResult<QuizProgressDoc[]> {
  return useQuery({
    queryKey: progressKeys.quizzes(userId ?? ""),
    queryFn: () => progressService.getAllQuizProgress(userId!),
    enabled: !!userId,
    staleTime: QUERY_STALE_TIME,
  });
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

/** Record a completed lesson attempt and update Firestore progress. */
export function useRecordLessonProgress(
  userId: string | undefined
): UseMutationResult<void, Error, { lessonId: string } & RecordLessonInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, ...input }) =>
      progressService.recordLessonCompletion(userId!, lessonId, input),
    onSuccess: (_data, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: progressKeys.lesson(userId ?? "", lessonId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.lessons(userId ?? "") });
      queryClient.invalidateQueries({ queryKey: progressKeys.stats(userId ?? "") });
    },
  });
}

/** Record a vocabulary review and apply SM-2 to Firestore progress. */
export function useRecordVocabReview(
  userId: string | undefined
): UseMutationResult<
  VocabProgressDoc | null,
  Error,
  { wordId: string; quality: RecallQuality; correct: boolean }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ wordId, quality, correct }) =>
      progressService.recordVocabReview(userId!, wordId, quality, correct),
    onSuccess: (_data, { wordId }) => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.vocabularyWord(userId ?? "", wordId),
      });
      queryClient.invalidateQueries({ queryKey: progressKeys.vocabularyDue(userId ?? "") });
      queryClient.invalidateQueries({ queryKey: progressKeys.stats(userId ?? "") });
    },
  });
}

/** Record a quiz attempt and update Firestore progress. */
export function useRecordQuizAttempt(
  userId: string | undefined
): UseMutationResult<void, Error, { quizId: string } & RecordQuizInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, ...input }) =>
      progressService.recordQuizAttempt(userId!, quizId, input),
    onSuccess: (_data, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: progressKeys.quiz(userId ?? "", quizId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.quizzes(userId ?? "") });
      queryClient.invalidateQueries({ queryKey: progressKeys.stats(userId ?? "") });
    },
  });
}

/** Sync local streak data to Firestore (call after streak store updates). */
export function useSyncStreak(userId: string | undefined): UseMutationResult<
  void,
  Error,
  { currentStreak: number; longestStreak: number; lastActiveDate: string | null }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ currentStreak, longestStreak, lastActiveDate }) =>
      progressService.syncStreakToFirestore(userId!, currentStreak, longestStreak, lastActiveDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.stats(userId ?? "") });
    },
  });
}

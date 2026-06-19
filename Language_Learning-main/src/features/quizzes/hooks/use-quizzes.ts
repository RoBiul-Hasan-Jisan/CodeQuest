"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import { QUERY_STALE_TIME } from "@/lib/constants";
import { quizKeys, type QuizListFilters } from "@/lib/firebase/query-keys";

import { quizService } from "../services/quiz-service";
import type {
  CreateQuestionInput,
  CreateQuizInput,
  Quiz,
  QuizAnswer,
  QuizGrade,
  QuizQuestion,
  QuizWithQuestions,
  UpdateQuestionInput,
  UpdateQuizInput,
} from "../types";



/* ============================================================================
   Quiz hooks
   ============================================================================ */

// ─── Query hooks ──────────────────────────────────────────────────────────────

/** Fetch quizzes with optional filters. */
export function useQuizzes(filters: QuizListFilters = {}): UseQueryResult<Quiz[]> {
  return useQuery({
    queryKey: quizKeys.list(filters),
    queryFn: () => quizService.list(filters),
    staleTime: QUERY_STALE_TIME,
  });
}

/** Fetch published quizzes for a lesson (learner-facing). */
export function useLessonQuizzes(lessonId: string | undefined): UseQueryResult<Quiz[]> {
  return useQuery({
    queryKey: quizKeys.byLesson(lessonId ?? ""),
    queryFn: () => quizService.getPublishedByLesson(lessonId!),
    enabled: !!lessonId,
    staleTime: QUERY_STALE_TIME,
  });
}

/** Single quiz by ID. */
export function useQuiz(quizId: string | undefined): UseQueryResult<Quiz | null> {
  return useQuery({
    queryKey: quizKeys.detail(quizId ?? ""),
    queryFn: () => quizService.getById(quizId!),
    enabled: !!quizId,
    staleTime: QUERY_STALE_TIME,
  });
}

/** Quiz with all questions pre-loaded — use for the quiz player screen. */
export function useQuizWithQuestions(
  quizId: string | undefined
): UseQueryResult<QuizWithQuestions | null> {
  return useQuery({
    queryKey: [...quizKeys.detail(quizId ?? ""), "withQuestions"],
    queryFn: () => quizService.getQuizWithQuestions(quizId!),
    enabled: !!quizId,
    staleTime: QUERY_STALE_TIME,
  });
}

/** Questions only. */
export function useQuizQuestions(
  quizId: string | undefined
): UseQueryResult<QuizQuestion[]> {
  return useQuery({
    queryKey: quizKeys.questions(quizId ?? ""),
    queryFn: () => quizService.getQuestions(quizId!),
    enabled: !!quizId,
    staleTime: QUERY_STALE_TIME,
  });
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

export function useCreateQuiz(): UseMutationResult<string, Error, CreateQuizInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => quizService.create(data),
    onSuccess: (_id, data) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      if (data.lessonId) {
        queryClient.invalidateQueries({ queryKey: quizKeys.byLesson(data.lessonId) });
      }
    },
  });
}

export function useUpdateQuiz(): UseMutationResult<
  void,
  Error,
  { id: string; data: UpdateQuizInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => quizService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: quizKeys.detail(id) });
      const previous = queryClient.getQueryData<Quiz>(quizKeys.detail(id));
      queryClient.setQueryData<Quiz | null>(quizKeys.detail(id), (old) =>
        old ? { ...old, ...data } : old
      );
      return { previous };
    },
    onError: (_err, { id }, ctx) => {
      queryClient.setQueryData(quizKeys.detail(id), ctx?.previous);
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
  });
}

export function useDeleteQuiz(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => quizService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: quizKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
  });
}

export function useAddQuestion(): UseMutationResult<
  string,
  Error,
  { quizId: string; question: CreateQuestionInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, question }) => quizService.addQuestion(quizId, question),
    onSuccess: (_id, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.questions(quizId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(quizId) });
    },
  });
}

export function useUpdateQuestion(): UseMutationResult<
  void,
  Error,
  { quizId: string; questionId: string; data: UpdateQuestionInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, questionId, data }) =>
      quizService.updateQuestion(quizId, questionId, data),
    onSuccess: (_data, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.questions(quizId) });
    },
  });
}

export function useReorderQuestions(): UseMutationResult<
  void,
  Error,
  { quizId: string; orderedIds: string[] }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, orderedIds }) => quizService.reorderQuestions(quizId, orderedIds),
    onSuccess: (_data, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.questions(quizId) });
    },
  });
}

/**
 * Grade a completed quiz attempt.
 * On success, also call `useRecordQuizProgress` to persist the result.
 */
export function useGradeQuiz(): UseMutationResult<
  QuizGrade,
  Error,
  { quizId: string; answers: QuizAnswer[]; totalTimeSec: number }
> {
  return useMutation({
    mutationFn: ({ quizId, answers, totalTimeSec }) =>
      quizService.gradeAttempt(quizId, answers, totalTimeSec),
  });
}

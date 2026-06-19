"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useEffect } from "react";

import { QUERY_STALE_TIME } from "@/lib/constants";
import { lessonKeys, type LessonListFilters } from "@/lib/firebase/query-keys";

import { lessonService } from "../services/lesson-service";
import type {
  CreateLessonInput,
  CreateSectionInput,
  Lesson,
  LessonSection,
  LessonWithSections,
  UpdateLessonInput,
  UpdateSectionInput,
} from "../types";



/* ============================================================================
   Lesson hooks — React Query wrappers around LessonService
   ============================================================================ */

// ─── Query hooks ──────────────────────────────────────────────────────────────

/** Fetch a paginated / filtered list of lessons. */
export function useLessons(filters: LessonListFilters = {}): UseQueryResult<Lesson[]> {
  return useQuery({
    queryKey: lessonKeys.list(filters),
    queryFn: () => lessonService.list(filters),
    staleTime: QUERY_STALE_TIME,
  });
}

/** Fetch only published lessons (learner-facing). */
export function usePublishedLessons(
  filters: Omit<LessonListFilters, "published"> = {}
): UseQueryResult<Lesson[]> {
  return useQuery({
    queryKey: lessonKeys.list({ ...filters, published: true }),
    queryFn: () => lessonService.getPublishedLessons(filters),
    staleTime: QUERY_STALE_TIME,
  });
}

/** Fetch all lessons for a specific course. */
export function useCourseLessons(
  courseId: string | undefined
): UseQueryResult<Lesson[]> {
  return useQuery({
    queryKey: lessonKeys.byCourse(courseId ?? ""),
    queryFn: () => lessonService.getLessonsByCourse(courseId!),
    enabled: !!courseId,
    staleTime: QUERY_STALE_TIME,
  });
}

/** Fetch a single lesson by ID. */
export function useLesson(
  lessonId: string | undefined
): UseQueryResult<Lesson | null> {
  return useQuery({
    queryKey: lessonKeys.detail(lessonId ?? ""),
    queryFn: () => lessonService.getById(lessonId!),
    enabled: !!lessonId,
    staleTime: QUERY_STALE_TIME,
  });
}

/** Fetch a lesson with all its sections pre-loaded. */
export function useLessonWithSections(
  lessonId: string | undefined
): UseQueryResult<LessonWithSections | null> {
  return useQuery({
    queryKey: [...lessonKeys.detail(lessonId ?? ""), "withSections"],
    queryFn: () => lessonService.getLessonWithSections(lessonId!),
    enabled: !!lessonId,
    staleTime: QUERY_STALE_TIME,
  });
}

/** Fetch sections for a lesson. */
export function useLessonSections(
  lessonId: string | undefined
): UseQueryResult<LessonSection[]> {
  return useQuery({
    queryKey: lessonKeys.sections(lessonId ?? ""),
    queryFn: () => lessonService.getSections(lessonId!),
    enabled: !!lessonId,
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * Subscribe to real-time lesson updates and push them into the Query cache.
 * Combine with `useLesson` in the same component.
 */
export function useLessonRealtime(lessonId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!lessonId) return;
    const key = lessonKeys.detail(lessonId);
    const unsubscribe = lessonService.subscribeToLesson(lessonId, (lesson) => {
      queryClient.setQueryData(key, lesson);
    });
    return unsubscribe;
  }, [lessonId, queryClient]);
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

/** Create a new lesson. Invalidates lesson list caches. */
export function useCreateLesson(): UseMutationResult<string, Error, CreateLessonInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => lessonService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
    },
  });
}

/** Update a lesson. Invalidates relevant caches. */
export function useUpdateLesson(): UseMutationResult<
  void,
  Error,
  { id: string; data: UpdateLessonInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => lessonService.update(id, data),
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: lessonKeys.detail(id) });
      const previous = queryClient.getQueryData<Lesson>(lessonKeys.detail(id));
      queryClient.setQueryData<Lesson | null>(lessonKeys.detail(id), (old) =>
        old ? { ...old, ...data } : old
      );
      return { previous };
    },
    onError: (_err, { id }, ctx) => {
      queryClient.setQueryData(lessonKeys.detail(id), ctx?.previous);
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
    },
  });
}

/** Publish a lesson (sets published: true). */
export function usePublishLesson(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => lessonService.publish(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
    },
  });
}

/** Delete a lesson and its Storage files. */
export function useDeleteLesson(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => lessonService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: lessonKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
    },
  });
}

/** Add a section to a lesson. */
export function useAddSection(): UseMutationResult<
  string,
  Error,
  { lessonId: string; section: CreateSectionInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, section }) => lessonService.addSection(lessonId, section),
    onSuccess: (_data, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.sections(lessonId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(lessonId) });
    },
  });
}

/** Update a section. */
export function useUpdateSection(): UseMutationResult<
  void,
  Error,
  { lessonId: string; sectionId: string; data: UpdateSectionInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, sectionId, data }) =>
      lessonService.updateSection(lessonId, sectionId, data),
    onSuccess: (_data, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.sections(lessonId) });
    },
  });
}

/** Reorder sections by passing an array of IDs in the desired order. */
export function useReorderSections(): UseMutationResult<
  void,
  Error,
  { lessonId: string; orderedIds: string[] }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, orderedIds }) =>
      lessonService.reorderSections(lessonId, orderedIds),
    onSuccess: (_data, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.sections(lessonId) });
    },
  });
}

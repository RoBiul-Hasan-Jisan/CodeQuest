"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";


import { useDebounce } from "@/hooks/use-debounce";
import { QUERY_STALE_TIME } from "@/lib/constants";
import { vocabularyKeys, type VocabularyListFilters } from "@/lib/firebase/query-keys";

import { vocabularyService } from "../services/vocabulary-service";
import type {
  CreateVocabularyEntryInput,
  UpdateVocabularyEntryInput,
  VocabularyEntry,
  VocabularyEntryFilters,
} from "../types/firestore";


/* ============================================================================
   Vocabulary catalog hooks
   ============================================================================ */

// ─── Query hooks ──────────────────────────────────────────────────────────────

/** List vocabulary words with optional filters. */
export function useVocabularyList(
  filters: VocabularyEntryFilters = {}
): UseQueryResult<VocabularyEntry[]> {
  return useQuery({
    queryKey: vocabularyKeys.list(filters as VocabularyListFilters),
    queryFn: () => vocabularyService.list(filters),
    staleTime: QUERY_STALE_TIME,
  });
}

/** Vocabulary words for a specific lesson. */
export function useLessonVocabulary(
  lessonId: string | undefined
): UseQueryResult<VocabularyEntry[]> {
  return useQuery({
    queryKey: vocabularyKeys.byLesson(lessonId ?? ""),
    queryFn: () => vocabularyService.getByLesson(lessonId!),
    enabled: !!lessonId,
    staleTime: QUERY_STALE_TIME,
  });
}

/** Single vocabulary entry by ID. */
export function useVocabularyEntry(
  wordId: string | undefined
): UseQueryResult<VocabularyEntry | null> {
  return useQuery({
    queryKey: vocabularyKeys.detail(wordId ?? ""),
    queryFn: () => vocabularyService.getById(wordId!),
    enabled: !!wordId,
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * Debounced vocabulary search hook.
 * Waits 300 ms after the last keystroke before querying Firestore.
 */
export function useVocabularySearch(
  searchTerm: string,
  language: string
): UseQueryResult<VocabularyEntry[]> {
  const debouncedTerm = useDebounce(searchTerm, 300);

  return useQuery({
    queryKey: vocabularyKeys.search(`${language}:${debouncedTerm}`),
    queryFn: () => vocabularyService.search(debouncedTerm, language),
    enabled: debouncedTerm.length >= 2 && !!language,
    staleTime: 1000 * 60 * 2, // 2 min — search results change less often
  });
}

/** Prefetch vocabulary for a lesson — call on hover / route prefetch. */
export function usePrefetchLessonVocabulary() {
  const queryClient = useQueryClient();
  return (lessonId: string) => {
    queryClient.prefetchQuery({
      queryKey: vocabularyKeys.byLesson(lessonId),
      queryFn: () => vocabularyService.getByLesson(lessonId),
      staleTime: QUERY_STALE_TIME,
    });
  };
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

/** Create a vocabulary entry. */
export function useCreateVocabularyEntry(): UseMutationResult<
  string,
  Error,
  CreateVocabularyEntryInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => vocabularyService.create(data),
    onSuccess: (_id, data) => {
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.lists() });
      if (data.lessonId) {
        queryClient.invalidateQueries({
          queryKey: vocabularyKeys.byLesson(data.lessonId),
        });
      }
    },
  });
}

/** Update a vocabulary entry with optimistic UI. */
export function useUpdateVocabularyEntry(): UseMutationResult<
  void,
  Error,
  { id: string; data: UpdateVocabularyEntryInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => vocabularyService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: vocabularyKeys.detail(id) });
      const previous = queryClient.getQueryData<VocabularyEntry>(vocabularyKeys.detail(id));
      queryClient.setQueryData<VocabularyEntry | null>(vocabularyKeys.detail(id), (old) =>
        old ? { ...old, ...data } : old
      );
      return { previous };
    },
    onError: (_err, { id }, ctx) => {
      queryClient.setQueryData(vocabularyKeys.detail(id), ctx?.previous);
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.lists() });
    },
  });
}

/** Delete a vocabulary entry. */
export function useDeleteVocabularyEntry(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => vocabularyService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: vocabularyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.lists() });
    },
  });
}

/** Upload audio pronunciation. */
export function useUploadVocabularyAudio(): UseMutationResult<
  string,
  Error,
  { wordId: string; file: File }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ wordId, file }) => vocabularyService.uploadAudio(wordId, file),
    onSuccess: (_url, { wordId }) => {
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.detail(wordId) });
    },
  });
}

/** Bulk import vocabulary words. */
export function useBulkCreateVocabulary(): UseMutationResult<
  string[],
  Error,
  CreateVocabularyEntryInput[]
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (words) => vocabularyService.bulkCreate(words),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.all() });
    },
  });
}

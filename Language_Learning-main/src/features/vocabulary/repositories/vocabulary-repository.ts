import {
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type FirestoreDataConverter,
} from "firebase/firestore";


import { COLLECTIONS } from "@/lib/constants";
import { BaseRepository } from "@/lib/firebase/base-repository";
import { createConverter } from "@/lib/firebase/converters";
import { normalizeError } from "@/lib/firebase/errors";

import type {
  CreateVocabularyEntryInput,
  UpdateVocabularyEntryInput,
  VocabularyEntry,
  VocabularyEntryFilters,
} from "../types/firestore";


/* ============================================================================
   VocabularyRepository — /vocabulary collection (word catalog)
   ============================================================================ */

export interface IVocabularyRepository {
  findById(id: string): Promise<VocabularyEntry | null>;
  findMany(filters?: VocabularyEntryFilters): Promise<VocabularyEntry[]>;
  findByLesson(lessonId: string): Promise<VocabularyEntry[]>;
  search(term: string, language: string, searchLimit?: number): Promise<VocabularyEntry[]>;
  create(data: CreateVocabularyEntryInput): Promise<string>;
  update(id: string, data: UpdateVocabularyEntryInput): Promise<void>;
  delete(id: string): Promise<void>;
}

class VocabularyRepository
  extends BaseRepository<VocabularyEntry>
  implements IVocabularyRepository
{
  protected readonly collectionPath = COLLECTIONS.VOCABULARY ?? "vocabulary";
  protected readonly converter: FirestoreDataConverter<VocabularyEntry> =
    createConverter<VocabularyEntry>();

  async findMany(filters: VocabularyEntryFilters = {}): Promise<VocabularyEntry[]> {
    try {
      const constraints = [];
      if (filters.language)     constraints.push(where("language", "==", filters.language));
      if (filters.lessonId)     constraints.push(where("lessonId", "==", filters.lessonId));
      if (filters.category)     constraints.push(where("category", "==", filters.category));
      if (filters.partOfSpeech) constraints.push(where("partOfSpeech", "==", filters.partOfSpeech));
      if (filters.difficulty)   constraints.push(where("difficulty", "==", filters.difficulty));
      constraints.push(orderBy("word", "asc"));
      if (filters.limit)        constraints.push(limit(filters.limit));

      const q = query(this.col, ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async findByLesson(lessonId: string): Promise<VocabularyEntry[]> {
    return this.findMany({ lessonId });
  }

  /**
   * Client-side prefix search — Firestore doesn't have full-text search.
   * For production, replace with Algolia / Typesense integration.
   */
  async search(
    term: string,
    language: string,
    searchLimit = 20
  ): Promise<VocabularyEntry[]> {
    try {
      const q = query(
        this.col,
        where("language", "==", language),
        where("word", ">=", term),
        where("word", "<=", `${term}\uf8ff`),
        orderBy("word"),
        limit(searchLimit)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (err) {
      throw normalizeError(err);
    }
  }
}

export const vocabularyRepository = new VocabularyRepository();

import { STORAGE_PATHS } from "@/lib/constants";
import { uploadFile } from "@/lib/firebase/storage";

import {
  vocabularyRepository,
  type IVocabularyRepository,
} from "../repositories/vocabulary-repository";
import type {
  CreateVocabularyEntryInput,
  UpdateVocabularyEntryInput,
  VocabularyEntry,
  VocabularyEntryFilters,
} from "../types/firestore";



/* ============================================================================
   VocabularyService — business logic for the word catalog
   ============================================================================ */

class VocabularyService {
  constructor(private readonly repo: IVocabularyRepository) {}

  async getById(id: string): Promise<VocabularyEntry | null> {
    return this.repo.findById(id);
  }

  async list(filters: VocabularyEntryFilters = {}): Promise<VocabularyEntry[]> {
    return this.repo.findMany(filters);
  }

  async getByLesson(lessonId: string): Promise<VocabularyEntry[]> {
    return this.repo.findByLesson(lessonId);
  }

  async search(term: string, language: string): Promise<VocabularyEntry[]> {
    const trimmed = term.trim().toLowerCase();
    if (trimmed.length < 2) return [];
    return this.repo.search(trimmed, language);
  }

  async create(data: CreateVocabularyEntryInput): Promise<string> {
    return this.repo.create(data);
  }

  async update(id: string, data: UpdateVocabularyEntryInput): Promise<void> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  /** Upload an audio pronunciation file for a word. Returns the download URL. */
  async uploadAudio(wordId: string, file: File): Promise<string> {
    const path = `${STORAGE_PATHS.AUDIO}/vocabulary/${wordId}`;
    const url = await uploadFile(path, file, { contentType: file.type });
    await this.repo.update(wordId, { audioUrl: url });
    return url;
  }

  /** Upload a word illustration. Returns the download URL. */
  async uploadImage(wordId: string, file: File): Promise<string> {
    const path = `${STORAGE_PATHS.IMAGES}/vocabulary/${wordId}`;
    const url = await uploadFile(path, file, { contentType: file.type });
    await this.repo.update(wordId, { imageUrl: url });
    return url;
  }

  /**
   * Bulk import words from an array.
   * Returns an array of newly created word IDs.
   */
  async bulkCreate(words: CreateVocabularyEntryInput[]): Promise<string[]> {
    return Promise.all(words.map((w) => this.repo.create(w)));
  }

  /**
   * Get random words for a flashcard / practice session.
   * Basic implementation — fetches by language then samples randomly.
   */
  async getRandomWords(language: string, count: number): Promise<VocabularyEntry[]> {
    const all = await this.repo.findMany({ language, limit: count * 5 });
    return all.sort(() => Math.random() - 0.5).slice(0, count);
  }
}

export const vocabularyService = new VocabularyService(vocabularyRepository);

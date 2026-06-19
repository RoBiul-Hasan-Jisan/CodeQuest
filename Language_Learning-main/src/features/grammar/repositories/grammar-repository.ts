import {
  limit,
  where,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { BaseRepository } from "@/lib/firebase/base-repository";

import type { GrammarCategory, GrammarDifficulty, GrammarQuizDoc } from "../types";


// ─── Converter ────────────────────────────────────────────────────────────────

const converter: FirestoreDataConverter<GrammarQuizDoc> = {
  toFirestore: ({ id: _id, ...rest }) => rest,
  fromFirestore: (snap: QueryDocumentSnapshot) => ({
    id: snap.id,
    ...(snap.data() as Omit<GrammarQuizDoc, "id">),
  }),
};

// ─── Repository ───────────────────────────────────────────────────────────────

class GrammarRepository extends BaseRepository<GrammarQuizDoc> {
  protected readonly collectionPath = "grammar_quizzes";
  protected readonly converter = converter;

  /**
   * Fetch cached quizzes for a category + difficulty pair.
   * Returns up to `maxResults` docs (newest first via client sort).
   * Uses only equality filters to avoid composite-index requirements.
   */
  async findByFilter(
    category: GrammarCategory,
    difficulty: GrammarDifficulty,
    maxResults = 5
  ): Promise<GrammarQuizDoc[]> {
    const docs = await this.queryWhere([
      where("category", "==", category),
      where("difficulty", "==", difficulty),
      limit(maxResults),
    ]);
    // Sort client-side to avoid needing a composite index
    return docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export const grammarRepository = new GrammarRepository();

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type FirestoreDataConverter,
  type Unsubscribe,
} from "firebase/firestore";


import { COLLECTIONS } from "@/lib/constants";
import { BaseRepository } from "@/lib/firebase/base-repository";
import { createConverter, createSubConverter } from "@/lib/firebase/converters";
import { normalizeError } from "@/lib/firebase/errors";
import { db } from "@/lib/firebase/firestore";

import type {
  CreateLessonInput,
  CreateSectionInput,
  Lesson,
  LessonListFilters,
  LessonSection,
  UpdateLessonInput,
  UpdateSectionInput,
} from "../types";


/* ============================================================================
   LessonRepository — all Firestore reads/writes for the `lessons` collection
   No business logic here; that lives in LessonService.
   ============================================================================ */

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ILessonRepository {
  findById(id: string): Promise<Lesson | null>;
  findMany(filters?: LessonListFilters): Promise<Lesson[]>;
  create(data: CreateLessonInput): Promise<string>;
  update(id: string, data: UpdateLessonInput): Promise<void>;
  delete(id: string): Promise<void>;
  // Sections subcollection
  getSections(lessonId: string): Promise<LessonSection[]>;
  addSection(lessonId: string, section: CreateSectionInput): Promise<string>;
  updateSection(lessonId: string, sectionId: string, data: UpdateSectionInput): Promise<void>;
  deleteSection(lessonId: string, sectionId: string): Promise<void>;
  reorderSections(lessonId: string, orderedIds: string[]): Promise<void>;
  // Realtime
  subscribeTo(id: string, callback: (lesson: Lesson | null) => void): Unsubscribe;
  subscribeToMany(filters: LessonListFilters, callback: (lessons: Lesson[]) => void): Unsubscribe;
}

// ─── Implementation ───────────────────────────────────────────────────────────

class LessonRepository extends BaseRepository<Lesson> implements ILessonRepository {
  protected readonly collectionPath = COLLECTIONS.LESSONS;
  protected readonly converter: FirestoreDataConverter<Lesson> = createConverter<Lesson>();

  // ── Lesson CRUD ─────────────────────────────────────────────────────────────

  async findMany(filters: LessonListFilters = {}): Promise<Lesson[]> {
    try {
      const constraints = [];
      if (filters.language)  constraints.push(where("language", "==", filters.language));
      if (filters.level)     constraints.push(where("level", "==", filters.level));
      if (filters.courseId)  constraints.push(where("courseId", "==", filters.courseId));
      if (filters.published !== undefined) {
        constraints.push(where("published", "==", filters.published));
      }
      constraints.push(orderBy("order", "asc"));
      if (filters.limit) constraints.push(limit(filters.limit));

      const q = query(this.col, ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async create(data: CreateLessonInput): Promise<string> {
    try {
      const ref = await addDoc(this.col, {
        ...data,
        sectionCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as unknown as Lesson);
      return ref.id;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async update(id: string, data: UpdateLessonInput): Promise<void> {
    try {
      await updateDoc(this.docRef(id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      throw normalizeError(err);
    }
  }

  // ── Sections subcollection ──────────────────────────────────────────────────

  private sectionsCol(lessonId: string) {
    return collection(db, COLLECTIONS.LESSONS, lessonId, "sections").withConverter(
      createSubConverter<LessonSection>()
    );
  }

  private sectionDocRef(lessonId: string, sectionId: string) {
    return doc(db, COLLECTIONS.LESSONS, lessonId, "sections", sectionId).withConverter(
      createSubConverter<LessonSection>()
    );
  }

  async getSections(lessonId: string): Promise<LessonSection[]> {
    try {
      const q = query(this.sectionsCol(lessonId), orderBy("order", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async addSection(lessonId: string, section: CreateSectionInput): Promise<string> {
    try {
      const ref = await addDoc(this.sectionsCol(lessonId), section as LessonSection);
      // Increment sectionCount on parent document
      const parentSnap = await getDoc(this.docRef(lessonId));
      const currentCount = (parentSnap.data()?.sectionCount ?? 0) as number;
      await updateDoc(this.docRef(lessonId), {
        sectionCount: currentCount + 1,
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async updateSection(
    lessonId: string,
    sectionId: string,
    data: UpdateSectionInput
  ): Promise<void> {
    try {
      await updateDoc(this.sectionDocRef(lessonId, sectionId), data as Partial<LessonSection>);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async deleteSection(lessonId: string, sectionId: string): Promise<void> {
    try {
      await deleteDoc(this.sectionDocRef(lessonId, sectionId));
      const lessonSnap = await getDoc(this.docRef(lessonId));
      const current = lessonSnap.data()?.sectionCount ?? 1;
      await updateDoc(this.docRef(lessonId), {
        sectionCount: Math.max(0, current - 1),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async reorderSections(lessonId: string, orderedIds: string[]): Promise<void> {
    try {
      await Promise.all(
        orderedIds.map((sectionId, index) =>
          updateDoc(this.sectionDocRef(lessonId, sectionId), { order: index })
        )
      );
    } catch (err) {
      throw normalizeError(err);
    }
  }

  // ── Realtime ────────────────────────────────────────────────────────────────

  subscribeToMany(
    filters: LessonListFilters,
    callback: (lessons: Lesson[]) => void
  ): Unsubscribe {
    const constraints = [];
    if (filters.language)  constraints.push(where("language", "==", filters.language));
    if (filters.courseId)  constraints.push(where("courseId", "==", filters.courseId));
    if (filters.published !== undefined) {
      constraints.push(where("published", "==", filters.published));
    }
    constraints.push(orderBy("order", "asc"));

    const q = query(this.col, ...constraints);
    return onSnapshot(
      q,
      (snap) => callback(snap.docs.map((d) => d.data())),
      (err) => console.error("[LessonRepository] subscription error:", err)
    );
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const lessonRepository = new LessonRepository();

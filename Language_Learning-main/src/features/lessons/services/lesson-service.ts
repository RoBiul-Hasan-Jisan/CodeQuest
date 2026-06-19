import { STORAGE_PATHS } from "@/lib/constants";
import { uploadFile, deleteFile } from "@/lib/firebase/storage";

import { lessonRepository, type ILessonRepository } from "../repositories/lesson-repository";
import type {
  CreateLessonInput,
  CreateSectionInput,
  Lesson,
  LessonListFilters,
  LessonSection,
  LessonWithSections,
  UpdateLessonInput,
  UpdateSectionInput,
} from "../types";



/* ============================================================================
   LessonService — business logic layer for lessons
   Calls the repository for data access and handles:
   - Media upload/delete coordination with Storage
   - Computed fields
   - Input validation / sanitisation
   ============================================================================ */

class LessonService {
  constructor(private readonly repo: ILessonRepository) {}

  // ── Queries ─────────────────────────────────────────────────────────────────

  async getById(id: string): Promise<Lesson | null> {
    return this.repo.findById(id);
  }

  async getByIdOrThrow(id: string): Promise<Lesson> {
    const lesson = await this.repo.findById(id);
    if (!lesson) throw new Error(`Lesson "${id}" not found.`);
    return lesson;
  }

  async list(filters: LessonListFilters = {}): Promise<Lesson[]> {
    return this.repo.findMany(filters);
  }

  async getPublishedLessons(filters: Omit<LessonListFilters, "published"> = {}): Promise<Lesson[]> {
    return this.repo.findMany({ ...filters, published: true });
  }

  async getLessonsByCourse(courseId: string, publishedOnly = true): Promise<Lesson[]> {
    return this.repo.findMany({ courseId, published: publishedOnly ? true : undefined });
  }

  /** Fetch a lesson with all its sections in a single call. */
  async getLessonWithSections(id: string): Promise<LessonWithSections | null> {
    const [lesson, sections] = await Promise.all([
      this.repo.findById(id),
      this.repo.getSections(id),
    ]);
    if (!lesson) return null;
    return { ...lesson, sections };
  }

  async getSections(lessonId: string): Promise<LessonSection[]> {
    return this.repo.getSections(lessonId);
  }

  // ── Mutations ───────────────────────────────────────────────────────────────

  async create(data: CreateLessonInput): Promise<string> {
    return this.repo.create(data);
  }

  async update(id: string, data: UpdateLessonInput): Promise<void> {
    return this.repo.update(id, data);
  }

  async publish(id: string): Promise<void> {
    return this.repo.update(id, { published: true });
  }

  async unpublish(id: string): Promise<void> {
    return this.repo.update(id, { published: false });
  }

  async delete(id: string): Promise<void> {
    const lesson = await this.repo.findById(id);
    // Clean up Storage files if present
    if (lesson?.thumbnailUrl) {
      await deleteFile(`${STORAGE_PATHS.IMAGES}/${id}_thumbnail`).catch(() => null);
    }
    return this.repo.delete(id);
  }

  // ── Thumbnail upload ────────────────────────────────────────────────────────

  async uploadThumbnail(lessonId: string, file: File): Promise<string> {
    const path = `${STORAGE_PATHS.IMAGES}/lessons/${lessonId}_thumbnail`;
    const url = await uploadFile(path, file, { contentType: file.type });
    await this.repo.update(lessonId, { thumbnailUrl: url });
    return url;
  }

  async uploadAudio(lessonId: string, sectionId: string, file: File): Promise<string> {
    const path = `${STORAGE_PATHS.AUDIO}/lessons/${lessonId}/${sectionId}`;
    const url = await uploadFile(path, file, { contentType: file.type });
    await this.repo.updateSection(lessonId, sectionId, { mediaUrl: url });
    return url;
  }

  // ── Section mutations ───────────────────────────────────────────────────────

  async addSection(lessonId: string, section: CreateSectionInput): Promise<string> {
    return this.repo.addSection(lessonId, section);
  }

  async updateSection(
    lessonId: string,
    sectionId: string,
    data: UpdateSectionInput
  ): Promise<void> {
    return this.repo.updateSection(lessonId, sectionId, data);
  }

  async deleteSection(lessonId: string, sectionId: string): Promise<void> {
    return this.repo.deleteSection(lessonId, sectionId);
  }

  async reorderSections(lessonId: string, orderedIds: string[]): Promise<void> {
    return this.repo.reorderSections(lessonId, orderedIds);
  }

  // ── Realtime ────────────────────────────────────────────────────────────────

  subscribeToLesson(id: string, callback: (lesson: Lesson | null) => void) {
    return this.repo.subscribeTo(id, callback);
  }

  subscribeToLessons(
    filters: LessonListFilters,
    callback: (lessons: Lesson[]) => void
  ) {
    return this.repo.subscribeToMany(filters, callback);
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const lessonService = new LessonService(lessonRepository);

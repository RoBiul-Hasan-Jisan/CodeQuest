import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type CollectionReference,
  type DocumentReference,
  type FirestoreDataConverter,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";

import { normalizeError } from "./errors";
import { db } from "./firestore";

/* ============================================================================
   BaseRepository — abstract Firestore repository
   All feature repositories extend this class.
   ============================================================================ */

export type CreateInput<T extends { id: string; createdAt: string; updatedAt: string }> = Omit<
  T,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateInput<T extends { id: string; createdAt: string; updatedAt: string }> = Partial<
  Omit<T, "id" | "createdAt">
>;

export abstract class BaseRepository<
  T extends { id: string; createdAt: string; updatedAt: string }
> {
  protected abstract readonly collectionPath: string;
  protected abstract readonly converter: FirestoreDataConverter<T>;

  // ── Typed collection / doc references ──────────────────────────────────────

  protected get col(): CollectionReference<T> {
    return collection(db, this.collectionPath).withConverter(this.converter);
  }

  protected docRef(id: string): DocumentReference<T> {
    return doc(db, this.collectionPath, id).withConverter(this.converter);
  }

  // ── Read ────────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<T | null> {
    try {
      const snap = await getDoc(this.docRef(id));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /** Internal helper — build a typed query from raw Firestore constraints. */
  protected async queryWhere(constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const q = query(this.col, ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (err) {
      throw normalizeError(err);
    }
  }

  // ── Write ───────────────────────────────────────────────────────────────────

  /**
   * Create a new document (Firestore auto-generates the ID).
   * Returns the new document ID.
   */
  async create(data: CreateInput<T>): Promise<string> {
    try {
      const ref = await addDoc(this.col, {
        ...(data as object),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as unknown as T);
      return ref.id;
    } catch (err) {
      throw normalizeError(err);
    }
  }

  /**
   * Set a document with a known ID (upsert behaviour).
   * Use when the ID is determined by the caller (e.g. userId).
   */
  async set(id: string, data: CreateInput<T>): Promise<void> {
    try {
      await setDoc(this.docRef(id), {
        ...(data as object),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as unknown as T);
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async update(id: string, data: UpdateInput<T>): Promise<void> {
    try {
      await updateDoc(this.docRef(id), {
        ...(data as object),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      throw normalizeError(err);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(this.docRef(id));
    } catch (err) {
      throw normalizeError(err);
    }
  }

  // ── Realtime subscriptions ──────────────────────────────────────────────────

  /**
   * Subscribe to a single document.
   * Returns an unsubscribe function — call it in useEffect cleanup.
   */
  subscribeTo(id: string, callback: (doc: T | null) => void): Unsubscribe {
    return onSnapshot(
      this.docRef(id),
      (snap) => callback(snap.exists() ? snap.data() : null),
      (err) => console.error(`[${this.constructor.name}] subscribeTo error:`, err)
    );
  }

  /**
   * Subscribe to a query result.
   * Returns an unsubscribe function.
   */
  /** Internal helper — subscribe to a typed query from raw Firestore constraints. */
  protected subscribeWhere(
    constraints: QueryConstraint[],
    callback: (docs: T[]) => void
  ): Unsubscribe {
    const q = query(this.col, ...constraints);
    return onSnapshot(
      q,
      (snap) => callback(snap.docs.map((d) => d.data())),
      (err) => console.error(`[${this.constructor.name}] subscribeWhere error:`, err)
    );
  }
}

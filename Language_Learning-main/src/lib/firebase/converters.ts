import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";

/* ============================================================================
   Firestore type converters
   - Maps Firestore Timestamps → ISO strings on read
   - Strips the `id` field on write (Firestore stores it as the doc key)
   ============================================================================ */

/**
 * Firestore document shape — all timestamp fields arrive as `Timestamp | null`.
 * We keep them opaque here; the generic converter turns them into ISO strings.
 */
export type WithTimestamps<T> = Omit<T, "createdAt" | "updatedAt"> & {
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

/** Safely convert a Firestore Timestamp (or null) to an ISO string. */
export function timestampToISO(ts: Timestamp | null | undefined): string {
  return ts ? ts.toDate().toISOString() : new Date().toISOString();
}

/**
 * Generic Firestore data converter.
 *
 * Usage:
 *   const lessonCol = collection(db, "lessons").withConverter(createConverter<Lesson>())
 *
 * The converter:
 *   - On read: injects `id` from snapshot.id; converts `createdAt`/`updatedAt` Timestamps to ISO strings
 *   - On write: strips `id`, `createdAt`, `updatedAt` (the repository sets them via serverTimestamp)
 */
export function createConverter<T extends { id: string; createdAt: string; updatedAt: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(model: T): DocumentData {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = model as Record<string, unknown>;
      return rest as DocumentData;
    },

    fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): T {
      const raw = snapshot.data(options) as Record<string, unknown>;
      return {
        ...raw,
        id: snapshot.id,
        createdAt: timestampToISO(raw.createdAt as Timestamp | null),
        updatedAt: timestampToISO(raw.updatedAt as Timestamp | null),
      } as T;
    },
  };
}

/**
 * Converter for subcollections that may not have standard timestamp fields.
 * Falls back to current time if timestamps are missing.
 */
export function createSubConverter<T extends { id: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(model: T): DocumentData {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = model as Record<string, unknown>;
      return rest as DocumentData;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): T {
      const raw = snapshot.data(options) as Record<string, unknown>;
      const result: Record<string, unknown> = { ...raw, id: snapshot.id };
      // Opportunistically convert any Timestamp fields
      for (const [key, value] of Object.entries(result)) {
        if (value && typeof value === "object" && "toDate" in value) {
          result[key] = (value as Timestamp).toDate().toISOString();
        }
      }
      return result as T;
    },
  };
}

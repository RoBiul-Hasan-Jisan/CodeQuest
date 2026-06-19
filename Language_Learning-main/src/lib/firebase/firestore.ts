import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  OrderByDirection,
  QueryConstraint,
  WhereFilterOp,
  WithFieldValue,
} from "firebase/firestore";

import { firebaseApp } from "./config";

export const db = getFirestore(firebaseApp);

// ─── Typed collection helper ────────────────────────────────────────────────

export function typedCollection<T extends DocumentData>(
  collectionPath: string
): CollectionReference<T> {
  return collection(db, collectionPath) as CollectionReference<T>;
}

export function typedDoc<T extends DocumentData>(
  collectionPath: string,
  docId: string
): DocumentReference<T> {
  return doc(db, collectionPath, docId) as DocumentReference<T>;
}

// ─── Generic CRUD helpers ───────────────────────────────────────────────────

export async function getDocument<T extends DocumentData>(
  collectionPath: string,
  docId: string
): Promise<(T & { id: string }) | null> {
  const ref = typedDoc<T>(collectionPath, docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getDocuments<T extends DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  const ref = typedCollection<T>(collectionPath);
  const q = query(ref, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createDocument<T extends DocumentData>(
  collectionPath: string,
  data: Omit<T, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = typedCollection<T>(collectionPath);
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as unknown as WithFieldValue<T>);
  return docRef.id;
}

export async function setDocument<T extends DocumentData>(
  collectionPath: string,
  docId: string,
  data: Omit<T, "id" | "createdAt" | "updatedAt">
): Promise<void> {
  const ref = typedDoc<T>(collectionPath, docId);
  await setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as unknown as WithFieldValue<T>);
}

export async function updateDocument<T extends DocumentData>(
  collectionPath: string,
  docId: string,
  data: Partial<Omit<T, "id" | "createdAt">>
): Promise<void> {
  const ref = typedDoc<T>(collectionPath, docId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteDocument(collectionPath: string, docId: string): Promise<void> {
  const ref = doc(db, collectionPath, docId);
  await deleteDoc(ref);
}

// ─── Re-export commonly used Firestore utilities ────────────────────────────

export { where, orderBy, limit, type WhereFilterOp, type OrderByDirection };

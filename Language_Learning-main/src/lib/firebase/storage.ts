import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import type { UploadMetadata, UploadTaskSnapshot } from "firebase/storage";

import { firebaseApp } from "./config";

export const storage = getStorage(firebaseApp);

// ─── Upload helpers ──────────────────────────────────────────────────────────

/**
 * Upload a file and return its public download URL.
 */
export async function uploadFile(
  path: string,
  file: File | Blob,
  metadata?: UploadMetadata
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, metadata);
  return getDownloadURL(storageRef);
}

/**
 * Upload a file with progress tracking.
 * Returns an unsubscribe function to cancel the upload.
 */
export function uploadFileWithProgress(
  path: string,
  file: File | Blob,
  callbacks: {
    onProgress?: (progress: number) => void;
    onSuccess?: (url: string) => void;
    onError?: (error: Error) => void;
  },
  metadata?: UploadMetadata
): () => void {
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file, metadata);

  task.on(
    "state_changed",
    (snapshot: UploadTaskSnapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      callbacks.onProgress?.(progress);
    },
    (error) => {
      callbacks.onError?.(error);
    },
    async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      callbacks.onSuccess?.(url);
    }
  );

  return () => task.cancel();
}

/**
 * Get the public download URL for a storage path.
 */
export async function getFileUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

/**
 * Delete a file at the given storage path.
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

/**
 * Build a namespaced storage path.
 * e.g. buildStoragePath("avatars", userId, "profile.jpg") → "avatars/userId/profile.jpg"
 */
export function buildStoragePath(...segments: string[]): string {
  return segments.join("/");
}

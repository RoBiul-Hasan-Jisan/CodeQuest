import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";


import { COLLECTIONS } from "@/lib/constants";
import { firebaseApp } from "@/lib/firebase/config";
import { setDocument } from "@/lib/firebase/firestore";

import type { LoginCredentials, RegisterCredentials } from "../types";


export const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// ─── Email / Password ────────────────────────────────────────────────────────

export async function loginWithEmail({ email, password }: LoginCredentials) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function registerWithEmail({ email, password, displayName }: RegisterCredentials) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  // Create user document in Firestore
  await setDocument(COLLECTIONS.USERS, credential.user.uid, {
    uid: credential.user.uid,
    email: credential.user.email ?? email,
    displayName,
    photoURL: null,
    role: "student",
    preferences: {
      locale: "en",
      dailyGoalMinutes: 15,
      notifications: true,
    },
  });

  return credential.user;
}

// ─── Google OAuth ────────────────────────────────────────────────────────────

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

// ─── Password reset ──────────────────────────────────────────────────────────

export async function sendResetEmail(email: string) {
  await sendPasswordResetEmail(auth, email);
}

// ─── Sign out ────────────────────────────────────────────────────────────────

export async function logout() {
  await signOut(auth);
}

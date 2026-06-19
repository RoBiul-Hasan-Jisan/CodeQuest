"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { auth } from "../services/auth-service";
import { useAuthStore } from "../store/auth-store";
import type { AuthUser } from "../types";

/**
 * Subscribes to Firebase Auth state changes and syncs them into the Zustand
 * auth store. Should be called once near the root of the component tree.
 */
export function useAuthListener() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: "student",
        };
        setUser(user);
        // Set a session cookie so the middleware can protect routes server-side
        document.cookie = "auth-session=1; path=/; max-age=86400; SameSite=Lax";
      } else {
        setUser(null);
        // Clear session cookie on sign-out
        document.cookie = "auth-session=; path=/; max-age=0; SameSite=Lax";
      }
    });

    return unsubscribe;
  }, [setUser]);
}

/** Read-only access to the current auth state */
export function useAuth() {
  return useAuthStore(
    useShallow((s) => ({
      user: s.user,
      isLoading: s.isLoading,
      isAuthenticated: s.isAuthenticated,
    }))
  );
}

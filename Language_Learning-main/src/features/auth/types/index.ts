import type { UserDocument } from "@/types/firebase";

// ─── Auth state ──────────────────────────────────────────────────────────────

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Auth user ───────────────────────────────────────────────────────────────

export type AuthUser = Pick<
  UserDocument,
  "uid" | "email" | "displayName" | "photoURL" | "role"
>;

// ─── Credentials ─────────────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  displayName: string;
}

// ─── Auth errors ─────────────────────────────────────────────────────────────

export type AuthErrorCode =
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/email-already-in-use"
  | "auth/weak-password"
  | "auth/invalid-email"
  | "auth/too-many-requests"
  | "auth/network-request-failed";

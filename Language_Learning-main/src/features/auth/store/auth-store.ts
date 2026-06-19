import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { AuthState, AuthUser } from "../types";

interface AuthStore extends AuthState {
  setUser: (user: AuthUser | null) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  isLoading: true, // true on first render — waiting for Firebase Auth observer
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setUser: (user) =>
        set({ user, isAuthenticated: user !== null, isLoading: false }),

      setIsLoading: (isLoading) => set({ isLoading }),

      reset: () => set(initialState),
    }),
    { name: "AuthStore" }
  )
);

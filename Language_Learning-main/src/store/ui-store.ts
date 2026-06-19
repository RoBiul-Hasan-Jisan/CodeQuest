import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/lib/constants";

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Mobile nav
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  // Global loading overlay
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Sidebar
        sidebarCollapsed: false,
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

        // Mobile nav
        mobileNavOpen: false,
        setMobileNavOpen: (open) => set({ mobileNavOpen: open }),

        // Global loading
        isLoading: false,
        setIsLoading: (loading) => set({ isLoading: loading }),
      }),
      {
        name: STORAGE_KEYS.SIDEBAR_COLLAPSED,
        // Only persist sidebar state
        partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
      }
    ),
    { name: "UIStore" }
  )
);

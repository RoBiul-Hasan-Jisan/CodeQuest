"use client";

import { useAuthListener } from "@/features/auth/hooks/use-auth";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";


interface ProvidersProps {
  children: React.ReactNode;
}

function AuthSync() {
  useAuthListener();
  return null;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthSync />
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
}

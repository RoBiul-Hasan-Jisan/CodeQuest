"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/hooks/use-auth";

export function LandingNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            L
          </div>
          Language Learning
        </div>

        {isLoading ? (
          <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        ) : isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">Welcome back!</span>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              Go to Dashboard →
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              Get started free
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

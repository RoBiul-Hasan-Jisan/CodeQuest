"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/features/auth/hooks/use-auth";

export function LandingHeroCta() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-glow-violet active:scale-[0.98]"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/lessons"
          className="flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-accent active:scale-[0.98]"
        >
          Browse lessons
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href="/register"
        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-glow-violet active:scale-[0.98]"
      >
        Start for free
        <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href="/dashboard"
        className="flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-accent active:scale-[0.98]"
      >
        View dashboard
      </Link>
    </div>
  );
}

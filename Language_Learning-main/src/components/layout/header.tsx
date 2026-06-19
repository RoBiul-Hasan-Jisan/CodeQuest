"use client";

import { LogOut, Menu, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { logout } from "@/features/auth/services/auth-service";
import { cn } from "@/lib/utils";

function UserAvatar({
  photoURL,
  displayName,
  size = "md",
}: {
  photoURL?: string | null;
  displayName?: string | null;
  size?: "sm" | "md";
}) {
  const initials = displayName
    ? displayName.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const cls = size === "sm" ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs";

  if (photoURL) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt={displayName ?? "User"}
        className={cn(cls, "rounded-full object-cover ring-2 ring-border")}
      />
    );
  }
  return (
    <div className={cn(cls, "flex items-center justify-center rounded-full bg-primary font-bold text-primary-foreground ring-2 ring-primary/30")}>
      {initials}
    </div>
  );
}

function UserMenu() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    setOpen(false);
    await logout();
    router.push("/login");
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
        >
          Get started
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-accent"
        aria-expanded={open}
      >
        <UserAvatar photoURL={user.photoURL} displayName={user.displayName} />
        <span className="hidden max-w-[100px] truncate text-sm font-medium text-foreground md:block">
          {user.displayName?.split(" ")[0] ?? "Account"}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-60 animate-scale-in overflow-hidden rounded-xl border border-border bg-popover shadow-float">
            {/* Profile bar */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <UserAvatar photoURL={user.photoURL} displayName={user.displayName} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{user.displayName ?? "Learner"}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="p-1">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Profile & Settings
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Preferences
              </Link>
            </div>

            <div className="border-t border-border p-1">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-glow-violet">
            L
          </div>
          <span className="hidden text-sm sm:block">{siteConfig.name}</span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

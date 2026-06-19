"use client";

import { Eye, EyeOff, Loader2, Mail, Lock, Chrome } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { loginWithEmail, loginWithGoogle } from "../services/auth-service";
import type { AuthErrorCode } from "../types";

// ─── Error messages ───────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<string, string> = {
  "auth/user-not-found":        "No account found with that email.",
  "auth/wrong-password":        "Incorrect password. Please try again.",
  "auth/invalid-credential":    "Invalid email or password.",
  "auth/invalid-email":         "Please enter a valid email address.",
  "auth/too-many-requests":     "Too many attempts. Please try again later.",
  "auth/network-request-failed":"Connection failed. Check your internet.",
  "auth/user-disabled":         "This account has been disabled.",
  "auth/popup-closed-by-user":  "Google sign-in was cancelled.",
};

function friendlyError(code: string): string {
  return ERROR_MESSAGES[code] ?? "Something went wrong. Please try again.";
}

// ─── Input component ──────────────────────────────────────────────────────────

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
  autoComplete?: string;
}

function InputField({ id, label, type, value, onChange, placeholder, icon, suffix, disabled, autoComplete }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? "/dashboard";
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail({ email, password });
      router.push(redirectTo);
    } catch (err: unknown) {
      const code = (err as { code?: AuthErrorCode }).code ?? "";
      setError(friendlyError(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push(redirectTo);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(friendlyError(code));
    } finally {
      setGoogleLoading(false);
    }
  }

  const busy = loading || googleLoading;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-input bg-background py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent hover:border-border/80 disabled:opacity-50 active:scale-[0.98]"
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Chrome className="h-4 w-4 text-[#4285F4]" />
        )}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-muted-foreground">or continue with email</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Email + Password */}
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        <InputField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          disabled={busy}
          autoComplete="email"
        />

        <InputField
          id="password"
          label="Password"
          type={showPw ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          disabled={busy}
          autoComplete="current-password"
          suffix={
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !email || !password}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>
    </div>
  );
}

"use client";

import { Check, Chrome, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginWithGoogle, registerWithEmail } from "../services/auth-service";

// ─── Error messages ───────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use":  "An account already exists with this email.",
  "auth/weak-password":         "Password must be at least 6 characters.",
  "auth/invalid-email":         "Please enter a valid email address.",
  "auth/too-many-requests":     "Too many attempts. Please try again later.",
  "auth/network-request-failed":"Connection failed. Check your internet.",
  "auth/popup-closed-by-user":  "Google sign-in was cancelled.",
};

function friendlyError(code: string): string {
  return ERROR_MESSAGES[code] ?? "Something went wrong. Please try again.";
}

// ─── Password strength ────────────────────────────────────────────────────────

function getStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: "", color: "" };
  if (pw.length < 6)   return { level: 1, label: "Weak", color: "bg-destructive" };
  if (pw.length < 10 || !/[0-9!@#$%^&*]/.test(pw))
    return { level: 2, label: "Fair", color: "bg-ds-amber" };
  return { level: 3, label: "Strong", color: "bg-ds-green" };
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

// ─── Register Form ────────────────────────────────────────────────────────────

export function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const strength = getStrength(password);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName || !email || !password) return;
    setError(null);
    setLoading(true);
    try {
      await registerWithEmail({ email, password, displayName });
      router.push("/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
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
      router.push("/dashboard");
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
        Sign up with Google
      </button>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-muted-foreground">or with email</span>
        <div className="flex-1 border-t border-border" />
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <InputField
          id="displayName"
          label="Full name"
          type="text"
          value={displayName}
          onChange={setDisplayName}
          placeholder="Alex Smith"
          icon={<User className="h-4 w-4" />}
          disabled={busy}
          autoComplete="name"
        />

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

        <div className="flex flex-col gap-1.5">
          <InputField
            id="password"
            label="Password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={setPassword}
            placeholder="Min 6 characters"
            icon={<Lock className="h-4 w-4" />}
            disabled={busy}
            autoComplete="new-password"
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

          {/* Strength bar */}
          {password.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= strength.level ? strength.color : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{strength.label}</span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Terms note */}
        <p className="text-xs text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>

        <button
          type="submit"
          disabled={busy || !displayName || !email || password.length < 6}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Create account
        </button>
      </form>
    </div>
  );
}

"use client";

import { Bell, Check, Globe, Loader2, LogOut, Mail, Palette, Shield, Target, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { logout } from "@/features/auth/services/auth-service";
import { cn } from "@/lib/utils";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function SettingsSection({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h2 className="font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function SettingsRow({ label, description, children }: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

// ─── Goal picker ─────────────────────────────────────────────────────────────

const DAILY_GOALS = [5, 10, 15, 20, 30] as const;

// ─── Theme picker ────────────────────────────────────────────────────────────

const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark",  label: "Dark" },
  { value: "system",label: "System" },
] as const;

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [dailyGoal, setDailyGoal]       = useState(15);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates]  = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [saved, setSaved]               = useState(false);

  async function handleSignOut() {
    setSignOutLoading(true);
    try {
      await logout();
      router.push("/login");
    } finally {
      setSignOutLoading(false);
    }
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          {saved ? <Check className="h-4 w-4" /> : null}
          {saved ? "Saved!" : "Save changes"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        {/* Nav (desktop) */}
        <nav className="hidden flex-col gap-1 lg:flex">
          {[
            { icon: User,    label: "Profile" },
            { icon: Target,  label: "Goals" },
            { icon: Palette, label: "Appearance" },
            { icon: Bell,    label: "Notifications" },
            { icon: Globe,   label: "Language" },
            { icon: Shield,  label: "Privacy" },
          ].map((item) => (
            <button
              key={item.label}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground text-left"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Panels */}
        <div className="flex flex-col gap-4">
          {/* Profile */}
          <SettingsSection title="Profile" description="Your public account information.">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
                {user?.displayName?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div>
                <p className="font-semibold text-foreground">{user?.displayName ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <SettingsRow label="Display name">
                <input
                  type="text"
                  defaultValue={user?.displayName ?? ""}
                  placeholder="Your name"
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 w-48"
                />
              </SettingsRow>
              <SettingsRow label="Email">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email ?? "—"}
                </div>
              </SettingsRow>
            </div>
          </SettingsSection>

          {/* Daily goal */}
          <SettingsSection
            title="Learning Goals"
            description="Set your daily practice target."
          >
            <SettingsRow label="Daily goal" description="Minutes to practice each day">
              <div className="flex items-center gap-1.5">
                {DAILY_GOALS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setDailyGoal(g)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                      dailyGoal === g
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {g}m
                  </button>
                ))}
              </div>
            </SettingsRow>
          </SettingsSection>

          {/* Appearance */}
          <SettingsSection title="Appearance" description="Choose your preferred colour scheme.">
            <SettingsRow label="Theme">
              <div className="flex items-center gap-1.5">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                      theme === t.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </SettingsRow>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection title="Notifications" description="Control when and how we reach you.">
            <div className="flex flex-col gap-4">
              <SettingsRow
                label="Push notifications"
                description="Daily reminders to practice"
              >
                <Toggle checked={notifications} onChange={setNotifications} />
              </SettingsRow>
              <SettingsRow
                label="Email updates"
                description="Weekly progress reports"
              >
                <Toggle checked={emailUpdates} onChange={setEmailUpdates} />
              </SettingsRow>
            </div>
          </SettingsSection>

          {/* Danger zone */}
          <SettingsSection title="Account" description="Manage your session and account.">
            <SettingsRow label="Sign out" description="Log out from this device">
              <button
                onClick={handleSignOut}
                disabled={signOutLoading}
                className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-all hover:bg-destructive/20 disabled:opacity-50"
              >
                {signOutLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Sign out
              </button>
            </SettingsRow>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}

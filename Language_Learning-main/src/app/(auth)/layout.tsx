import { BookMarked, BotMessageSquare, FlaskConical, Mic2, PenLine, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in or create an account to get started.",
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

const FEATURE_LIST = [
  { icon: BookMarked,     text: "Vocabulary with spaced repetition" },
  { icon: FlaskConical,   text: "AI grammar quizzes" },
  { icon: Mic2,           text: "Speaking practice with feedback" },
  { icon: PenLine,        text: "AI writing assistant" },
  { icon: BotMessageSquare, text: "Personal AI tutor 24/7" },
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="relative hidden flex-col justify-between bg-muted p-10 lg:flex dark:bg-muted/20">
        {/* Logo */}
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            L
          </div>
          Language Learning
        </div>

        {/* Features */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1.5 w-fit text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" />
            Powered by Google Gemini AI
          </div>
          <h2 className="text-2xl font-bold text-foreground leading-snug">
            Learn English faster<br />with AI feedback
          </h2>
          <ul className="flex flex-col gap-2.5">
            {FEATURE_LIST.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background/60">
                  <Icon className="h-3.5 w-3.5 text-foreground" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Quote */}
        <blockquote className="space-y-1.5">
          <p className="text-sm italic text-muted-foreground">
            &ldquo;The limits of my language mean the limits of my world.&rdquo;
          </p>
          <footer className="text-xs font-medium text-muted-foreground/70">— Ludwig Wittgenstein</footer>
        </blockquote>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-6 sm:p-12">{children}</div>
    </div>
  );
}

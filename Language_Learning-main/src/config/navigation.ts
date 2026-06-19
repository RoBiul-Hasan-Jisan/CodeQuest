import {
  Award,
  BookOpen,
  BookMarked,
  BotMessageSquare,
  ChartBar,
  FlaskConical,
  LayoutDashboard,
  Mic2,
  PenLine,
  Settings,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of your progress",
  },
  {
    label: "Lessons",
    href: "/lessons",
    icon: BookOpen,
    description: "Browse and start lessons",
  },
  {
    label: "AI Tutor",
    href: "/tutor",
    icon: BotMessageSquare,
    description: "Chat with your AI English tutor",
  },
  {
    label: "Vocabulary",
    href: "/vocabulary",
    icon: BookMarked,
    description: "Build and review your word library",
  },
  {
    label: "Grammar Lab",
    href: "/grammar",
    icon: FlaskConical,
    description: "AI-powered grammar quizzes",
  },
  {
    label: "Writing",
    href: "/writing",
    icon: PenLine,
    description: "AI writing assistant",
  },
  {
    label: "Speaking",
    href: "/speaking",
    icon: Mic2,
    description: "Voice practice with AI feedback",
  },
  {
    label: "Progress",
    href: "/progress",
    icon: ChartBar,
    description: "Track your learning journey",
  },
  {
    label: "Achievements",
    href: "/achievements",
    icon: Trophy,
    description: "View your badges and milestones",
  },
  {
    label: "Certificates",
    href: "/certificates",
    icon: Award,
    description: "Earn CEFR certificates for your progress",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Account and preferences",
  },
];

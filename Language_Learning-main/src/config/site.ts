import { APP_NAME, APP_URL } from "@/lib/constants";

export const siteConfig = {
  name: APP_NAME,
  description:
    "A production-grade language learning platform. Master new languages with interactive lessons, spaced repetition, and real-time progress tracking.",
  url: APP_URL,
  author: "Language Learning Team",
  twitterHandle: "@languagelearning",
  keywords: [
    "language learning",
    "education",
    "vocabulary",
    "grammar",
    "spaced repetition",
    "interactive lessons",
  ],
} as const;

export type SiteConfig = typeof siteConfig;

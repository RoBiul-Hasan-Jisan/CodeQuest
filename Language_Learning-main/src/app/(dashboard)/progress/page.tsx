import type { Metadata } from "next";

import { AnalyticsClient } from "@/features/analytics/components/analytics-client";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "Visualize your learning streak, accuracy trends, vocabulary growth, grammar mastery, and monthly improvements.",
};

export default function ProgressPage() {
  return <AnalyticsClient />;
}

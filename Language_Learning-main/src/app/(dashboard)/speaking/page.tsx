import type { Metadata } from "next";

import { SpeakingClient } from "@/features/speaking/components/speaking-client";

export const metadata: Metadata = {
  title: "Speaking Practice",
  description:
    "Improve English pronunciation, fluency, and conversation skills with AI-powered feedback.",
};

export default function SpeakingPage() {
  return <SpeakingClient />;
}

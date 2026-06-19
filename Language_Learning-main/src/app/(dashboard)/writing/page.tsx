import type { Metadata } from "next";

import { WritingClient } from "@/features/writing/components/writing-client";

export const metadata: Metadata = {
  title: "AI Writing Assistant",
  description: "Grammar correction, tone conversion, and vocabulary enhancement powered by Gemini.",
};

export default function WritingPage() {
  return <WritingClient />;
}

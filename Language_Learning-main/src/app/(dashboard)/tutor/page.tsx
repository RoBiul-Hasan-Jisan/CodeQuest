import type { Metadata } from "next";

import { TutorClient } from "@/features/tutor/components/tutor-client";

export const metadata: Metadata = {
  title: "AI Tutor",
  description: "Chat with Aria, your AI English tutor powered by Gemini.",
};

export default function TutorPage() {
  return (
    // Fill the remaining viewport height so the chat layout works
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:h-[calc(100vh-5rem)]">
      <TutorClient />
    </div>
  );
}

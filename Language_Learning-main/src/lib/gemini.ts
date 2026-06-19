import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("[gemini] GEMINI_API_KEY is not set — AI tutor will return errors.");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

/** Flash 2.0 — fast, cheap, great for chat */
export const GEMINI_MODEL = "gemini-2.0-flash";

export function getTutorModel() {
  return genAI.getGenerativeModel({ model: GEMINI_MODEL });
}

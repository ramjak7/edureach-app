import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export function getGeminiModel(modelName = "gemini-3.1-flash-lite-preview") {
  return genAI.getGenerativeModel({ model: modelName });
}

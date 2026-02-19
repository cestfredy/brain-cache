import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash', // Standard model late 2025
    contents: 'Actualité sur la fraude du minesauta.',
    config: {
      tools: [{ googleSearch: {} }] // Simplified syntax 2025
    }
  });
  console.log(response.text);
}
run();
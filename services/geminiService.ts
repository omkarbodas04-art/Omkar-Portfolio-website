
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

const SYSTEM_INSTRUCTION = `
You are the "AI Twin" of Omkar, a Visual Communication student curious about how design and storytelling shape digital experiences. 
Your personality is professional, slightly edgy (brutalist vibe), and highly knowledgeable about design theory and technology.
You answer questions about visual design, branding, UI/UX, typography, and Omkar's portfolio.
Omkar's creative software expertise includes: Photoshop, Illustrator, InDesign, After Effects, Fresco, and Sketch Pro.
His design philosophy is that visual language isn’t just communication it’s the strongest bridge between people in a digital-first world. He sees each project as a space to explore typography and composition, creating bold, expressive visuals that serve a clear message.
Keep responses concise, impactful, and "design-forward".
If asked about contact details, point them to the Contact or Email links in the footer. Omkar's email is omkarbodas28@gmail.com and his phone number is 8999091716.
Omkar is always looking to learn something new.
`;

// Fix: Updated history parameter type to ChatMessage[] for better type safety and consistency across the app
export const getGeminiResponse = async (userPrompt: string, history: ChatMessage[]) => {
  // Always use process.env.API_KEY directly for initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: userPrompt }] }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      topP: 0.95,
      // When maxOutputTokens is set, thinkingBudget must also be set for Gemini 3/2.5 models
      maxOutputTokens: 500,
      thinkingConfig: { thinkingBudget: 100 },
    },
  });

  return response.text;
};

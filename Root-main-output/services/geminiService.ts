
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface ExamNews {
  text: string;
  sources: { uri: string; title: string }[];
  verifiedDate?: string; 
  isConfirmed: boolean;
}

export const fetchLatestExamNews = async (): Promise<ExamNews> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Search for the GCE A/L official examination schedule from the Department of Examinations Sri Lanka (doenets.lk). Focus strictly on the upcoming academic cycle.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title
      }))
      .filter((s: any) => s.uri && s.title) || [];

    const text = response.text || "";
    const isConfirmed = text.toLowerCase().includes("confirmed") || text.toLowerCase().includes("officially announced");

    return {
      text: text || "Scanning official government portals strictly for the upcoming A/L schedule...",
      sources: sources.slice(0, 4),
      isConfirmed
    };
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      console.warn("Gemini API quota exceeded. Falling back to offline exam news.");
    } else {
      console.error("Failed to fetch exam news:", error);
    }
    return {
      text: "Unable to reach official servers. Please check doenets.lk directly.",
      sources: [{ uri: "https://www.doenets.lk", title: "Department of Examinations Sri Lanka" }],
      isConfirmed: false
    };
  }
};

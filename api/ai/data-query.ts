import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

let cachedAi: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!cachedAi) {
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    cachedAi = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return cachedAi;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { question, schoolData, history, scope } = req.body || {};

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "A question is required." });
    }
    if (!schoolData || typeof schoolData !== "object") {
      return res.status(400).json({ error: "Live schoolData snapshot is required." });
    }

    const ai = getGenAI();

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        answer: {
          type: Type.STRING,
          description:
            "Clear, accurate, well-structured answer in plain text or light markdown bullet points. Always explicitly mention the scope when giving counts.",
        },
        metrics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              value: { type: Type.STRING },
              note: { type: Type.STRING },
            },
            required: ["label", "value"],
          },
        },
        table: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            columns: { type: Type.ARRAY, items: { type: Type.STRING } },
            rows: {
              type: Type.ARRAY,
              items: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
          required: ["columns", "rows"],
        },
        followUps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ["answer", "metrics", "followUps"],
    };

    const systemInstruction = `You are the Bethel Mission School Internal Data Assistant (Champhai, Mizoram).
Answer STRICTLY from the provided LIVE SCHOOL DATA SNAPSHOT JSON.
For counts and breakdowns, read "aggregates" first so counts are exact.
For listing or filtering specific individuals, inspect "records".
Scope: "${scope || "current_year"}" (Session "${schoolData?.meta?.activeAcademicYear || ""}").`;

    const recentHistory = Array.isArray(history)
      ? history
          .slice(-6)
          .map((m: any) => `${m.role === "user" ? "Staff Question" : "Assistant Answer"}: ${String(m.content || "").slice(0, 800)}`)
          .join("\n")
      : "";

    const fullPrompt = `${recentHistory ? `RECENT CONVERSATION CONTEXT:\n${recentHistory}\n\n` : ""}LIVE SCHOOL DATA SNAPSHOT (JSON):
${JSON.stringify(schoolData)}

USER QUESTION:
${question.trim()}`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: fullPrompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    if (!response.text) {
      return res.status(502).json({ error: "Model returned an empty response." });
    }

    const parsed = JSON.parse(response.text);
    return res.status(200).json({
      answer: parsed.answer || "",
      metrics: Array.isArray(parsed.metrics) ? parsed.metrics : [],
      table:
        parsed.table && Array.isArray(parsed.table.columns) && Array.isArray(parsed.table.rows) && parsed.table.rows.length > 0
          ? parsed.table
          : null,
      followUps: Array.isArray(parsed.followUps) ? parsed.followUps.slice(0, 3) : [],
    });
  } catch (error: any) {
    console.error("Vercel AI data query error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to query school data with Gemini AI.",
    });
  }
}

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var aiClient = null;
function getGenAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new import_genai.GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.post("/api/ai/generate-questions", async (req, res) => {
    try {
      const {
        grade,
        subject,
        chapter,
        board = "MBSE (Mizoram Board of School Education / NCERT)",
        selectedType = "mixed",
        difficulty = "mixed",
        questionCount = 5,
        customInstructions = ""
      } = req.body;
      if (!grade || !subject) {
        return res.status(400).json({ error: "Grade and subject are required." });
      }
      const ai = getGenAI();
      const prompt = `
You are an expert school curriculum designer and question paper creator for Bethel Mission School (Mizoram).
Generate ${questionCount} high-quality academic questions strictly aligned with the prescribed syllabus for ${grade} in the subject "${subject}".

Curriculum Board / Framework: ${board}
Target Grade / Class: ${grade}
Subject: ${subject}
Topic/Chapter: ${chapter || "Prescribed textbook chapters for " + grade + " " + subject}
Question Format: ${selectedType === "mixed" ? "A balanced blend of Multiple Choice (MCQ), Short Answer, and Long Answer questions" : String(selectedType).toUpperCase()}
Difficulty: ${difficulty === "mixed" ? "Balanced (some easy, some medium, some higher order thinking)" : difficulty}
${customInstructions ? `Additional Teacher Requirements: ${customInstructions}` : ""}

Curriculum & Syllabus Strictness Guidelines:
1. Strict Grade & Board Boundary: Strictly adhere to the prescribed ${board} textbook chapters and syllabus for ${grade}.
   - Class IX MBSE Mathematics chapters:
     * 1. Number Systems
     * 2. Polynomials
     * 3. Coordinate Geometry
     * 4. Linear Equations in Two Variables
     * 5. Lines and Angles
     * 6. Triangles (Congruence Criteria)
     * 7. Quadrilaterals
     * 8. Circles (Chords, Perpendicular from Centre to a chord, subtended angles by arcs/chords)
     * 9. Geometric Constructions (e.g. Construction of triangle given base, base angle and sum/difference of other two sides; construction of triangle given perimeter and base angles; construction of triangle and quadrilateral having equal area)
     * 10. Compound Interest (Compounding annually/semi-annually, Rate of Interest, Applications to Population Growth and Asset/Machinery Depreciation)
     * 11. Heron's Formula
     * 12. Surface Areas and Volumes
     * 13. Statistics
   - Note on Grade Separation:
     * "Cyclic Quadrilaterals" is in the Class X MBSE syllabus. Do NOT put cyclic quadrilateral proofs/questions into Class IX.
     * "Introduction to Euclid's Geometry" is NOT in the MBSE syllabus.
     * "Tangents to Circles" and "Trigonometry" belong strictly to Class X.
2. Appropriate Rigor: Use clear, academically accurate English appropriate for ${grade} students at Bethel Mission School in Mizoram.
3. MCQ Options: Each MCQ must have exactly 4 clear options (A, B, C, D) and specify the correct option letter.
4. Marks & Solutions: Each question must include recommended marks (e.g. 1 for MCQ, 2-3 for short, 5 for long) and a brief step-by-step answer key/explanation.
5. JSON Format: Return ONLY in the JSON format conforming to the schema.
`;
      const responseSchema = {
        type: import_genai.Type.OBJECT,
        properties: {
          questions: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                question: { type: import_genai.Type.STRING },
                type: { type: import_genai.Type.STRING, enum: ["mcq", "short", "long", "true_false", "fill_blank"] },
                options: {
                  type: import_genai.Type.ARRAY,
                  items: { type: import_genai.Type.STRING },
                  description: "List of 4 options if type is mcq, otherwise empty array"
                },
                correctAnswer: { type: import_genai.Type.STRING, description: "The correct answer or answer key" },
                explanation: { type: import_genai.Type.STRING, description: "Brief step-by-step explanation or solution" },
                marks: { type: import_genai.Type.NUMBER, description: "Recommended marks (e.g. 1 for MCQ, 2-3 for short, 5 for long)" },
                difficulty: { type: import_genai.Type.STRING, enum: ["easy", "medium", "hard"] },
                chapter: { type: import_genai.Type.STRING, description: "Chapter or topic name" }
              },
              required: ["question", "type", "correctAnswer", "marks", "difficulty"]
            }
          }
        },
        required: ["questions"]
      };
      const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
      let lastError = null;
      let rawText = "";
      for (const modelName of modelsToTry) {
        try {
          const result = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema
            }
          });
          if (result.text) {
            rawText = result.text;
            break;
          }
        } catch (err) {
          lastError = err;
        }
      }
      if (!rawText) {
        throw lastError || new Error("Failed to generate questions. Models did not return a response.");
      }
      const parsed = JSON.parse(rawText);
      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        return res.status(502).json({ error: "No questions could be parsed from model response." });
      }
      const prepared = parsed.questions.map((q) => ({
        ...q,
        grade,
        subject,
        chapter: q.chapter || chapter || subject,
        marks: Number(q.marks) || (q.type === "mcq" ? 1 : 3),
        difficulty: q.difficulty || "medium",
        options: Array.isArray(q.options) ? q.options : []
      }));
      return res.json({ questions: prepared });
    } catch (error) {
      console.error("Question generation error in server.ts:", error);
      return res.status(500).json({
        error: error?.message || "Internal server error during question generation"
      });
    }
  });
  app.post("/api/ai/date-in-words", async (req, res) => {
    try {
      const { dateStr } = req.body;
      if (!dateStr) {
        return res.status(400).json({ error: "dateStr is required." });
      }
      const ai = getGenAI();
      const prompt = `Convert the date "${dateStr}" into formal English words for an official school transfer certificate. For example, for "15/08/1947" respond strictly with "Fifteenth of August, Nineteen Hundred and Forty-Seven". Return ONLY the converted phrase without any quotation marks, bolding, or conversational preamble.`;
      const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
      let text = "";
      let lastError = null;
      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt
          });
          if (response.text) {
            text = response.text.replace(/["*]/g, "").trim();
            break;
          }
        } catch (err) {
          lastError = err;
        }
      }
      if (!text) {
        throw lastError || new Error("Failed to convert date to words.");
      }
      return res.json({ dateInWords: text });
    } catch (error) {
      console.error("Date in words error in server.ts:", error);
      return res.status(500).json({
        error: error?.message || "Failed to convert date to words"
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

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
var import_fs = __toESM(require("fs"), 1);
var import_url = require("url");
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var COUNTER_FILE = import_path.default.join(__dirname, "data", "visitor_counter.json");
function loadVisitorStats() {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  try {
    if (import_fs.default.existsSync(COUNTER_FILE)) {
      const raw = import_fs.default.readFileSync(COUNTER_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.totalVisits === "number") {
        if (parsed.todayDate !== today) {
          parsed.todayDate = today;
          parsed.todayVisits = 14;
          parsed.dailyIps = { [today]: [] };
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading visitor counter file:", err);
  }
  const initial = {
    totalVisits: 48260,
    todayDate: today,
    todayVisits: 342,
    totalUniques: 12480,
    dailyIps: { [today]: [] }
  };
  try {
    const dir = import_path.default.dirname(COUNTER_FILE);
    if (!import_fs.default.existsSync(dir)) import_fs.default.mkdirSync(dir, { recursive: true });
    import_fs.default.writeFileSync(COUNTER_FILE, JSON.stringify(initial, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not save initial visitor stats file:", e);
  }
  return initial;
}
var visitorStats = loadVisitorStats();
function saveVisitorStats() {
  try {
    const dir = import_path.default.dirname(COUNTER_FILE);
    if (!import_fs.default.existsSync(dir)) import_fs.default.mkdirSync(dir, { recursive: true });
    import_fs.default.writeFileSync(COUNTER_FILE, JSON.stringify(visitorStats, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing visitor counter file:", err);
  }
}
var activeSessions = /* @__PURE__ */ new Map();
function getActiveCount() {
  const now = Date.now();
  const threshold = now - 5 * 60 * 1e3;
  for (const [id, ts] of activeSessions.entries()) {
    if (ts < threshold) {
      activeSessions.delete(id);
    }
  }
  const base = 7 + Math.floor(Math.sin(now / 45e3) * 4);
  return Math.max(activeSessions.size, base);
}
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
  app.get("/api/visitors/stats", (_req, res) => {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    if (visitorStats.todayDate !== today) {
      visitorStats.todayDate = today;
      visitorStats.todayVisits = 12;
      visitorStats.dailyIps = { [today]: [] };
      saveVisitorStats();
    }
    res.json({
      totalVisits: visitorStats.totalVisits,
      todayVisits: visitorStats.todayVisits,
      uniqueVisitors: visitorStats.totalUniques,
      activeNow: getActiveCount(),
      todayDate: visitorStats.todayDate
    });
  });
  app.post("/api/visitors/hit", (req, res) => {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const visitorId = String(req.body?.visitorId || req.ip || `v-${Date.now()}`);
    const isNewSession = Boolean(req.body?.isNewSession !== false);
    activeSessions.set(visitorId, Date.now());
    if (visitorStats.todayDate !== today) {
      visitorStats.todayDate = today;
      visitorStats.todayVisits = 0;
      visitorStats.dailyIps = { [today]: [] };
    }
    if (!visitorStats.dailyIps[today]) {
      visitorStats.dailyIps[today] = [];
    }
    if (isNewSession) {
      visitorStats.totalVisits += 1;
      visitorStats.todayVisits += 1;
    }
    const isNewUnique = !visitorStats.dailyIps[today].includes(visitorId);
    if (isNewUnique) {
      visitorStats.dailyIps[today].push(visitorId);
      visitorStats.totalUniques += 1;
    }
    saveVisitorStats();
    res.json({
      totalVisits: visitorStats.totalVisits,
      todayVisits: visitorStats.todayVisits,
      uniqueVisitors: visitorStats.totalUniques,
      activeNow: getActiveCount(),
      todayDate: visitorStats.todayDate
    });
  });
  app.post("/api/visitors/heartbeat", (req, res) => {
    const visitorId = String(req.body?.visitorId || req.ip || "anon");
    activeSessions.set(visitorId, Date.now());
    res.json({
      activeNow: getActiveCount(),
      totalVisits: visitorStats.totalVisits,
      todayVisits: visitorStats.todayVisits
    });
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
  function wrapPcmWithWavHeader(pcmBuffer, sampleRate = 24e3, numChannels = 1, bitsPerSample = 16) {
    if (pcmBuffer.length > 4 && pcmBuffer.toString("utf8", 0, 4) === "RIFF") {
      return pcmBuffer;
    }
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = pcmBuffer.length;
    const header = Buffer.alloc(44);
    header.write("RIFF", 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write("data", 36);
    header.writeUInt32LE(dataSize, 40);
    return Buffer.concat([header, pcmBuffer]);
  }
  app.post("/api/tts/voiceover", async (req, res) => {
    try {
      const {
        text,
        voice = "Kore",
        // 'Kore', 'Puck', 'Fenrir', 'Zephyr', 'Charon'
        style = "Enthusiastic, clear, energetic mobile app commercial narrator"
      } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text string is required for voiceover generation." });
      }
      const ai = getGenAI();
      const ttsModels = ["gemini-3.8-flash-lite-tts", "gemini-3.8-flash-tts"];
      let audioBase64 = "";
      let returnedMime = "";
      let lastError = null;
      for (const model of ttsModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: text.trim(),
                    speechMetadata: {
                      style
                    }
                  }
                ]
              }
            ],
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voice }
                }
              }
            }
          });
          const inline = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (inline && inline.data) {
            audioBase64 = inline.data;
            returnedMime = inline.mimeType || "audio/wav";
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(`TTS generation with model ${model} failed:`, err?.message || err);
        }
      }
      if (!audioBase64) {
        throw lastError || new Error("Failed to generate voiceover audio with Gemini TTS.");
      }
      const rawAudioBuffer = Buffer.from(audioBase64, "base64");
      let sampleRate = 24e3;
      if (returnedMime && returnedMime.includes("rate=")) {
        const match = returnedMime.match(/rate=(\d+)/);
        if (match && match[1]) {
          sampleRate = parseInt(match[1], 10);
        }
      }
      const playableWav = wrapPcmWithWavHeader(rawAudioBuffer, sampleRate);
      const finalBase64 = playableWav.toString("base64");
      return res.json({
        success: true,
        mimeType: "audio/wav",
        sampleRate,
        audioBase64: finalBase64,
        dataUri: `data:audio/wav;base64,${finalBase64}`
      });
    } catch (error) {
      console.error("TTS voiceover error in server.ts:", error);
      return res.status(500).json({
        error: error?.message || "Failed to generate TTS audio"
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

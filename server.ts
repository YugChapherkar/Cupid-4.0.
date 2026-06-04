import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Setup
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });
  }

  // API Routes
  app.get('/api/gemini/status', (req, res) => {
    res.json({ configReady: !!ai });
  });

  app.post('/api/gemini/summary', async (req, res) => {
    const { transcript } = req.body;
    if (!ai) return res.json({ result: "Simulation: Great session! You worked on React components and fixed a state bug. Next steps: Add persistence." });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `
SYSTEM: You are a friendly assistant that summarizes developer pair-programming sessions in 2-3 concise sentences.
USER: Summarize the following session chat transcript. Say what was worked on, one bug/issue solved, and 2 next steps for the pair to continue. Keep it friendly and professional.
TRANSCRIPT:
${transcript}
        `,
      });
      res.json({ result: response.text });
    } catch (e) {
      console.error(e);
      res.json({ result: "Error generating summary." });
    }
  });

  app.post('/api/gemini/itinerary', async (req, res) => {
    const { city, mood, budget } = req.body;
    if (!ai) return res.json({ result: "Simulation: 1. Cafe Verve (Cozy) - 6PM. 2. Code & Coffee (Work) - 7PM. 3. The Byte Bar (Drinks) - 9PM." });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `
SYSTEM: You are an upbeat travel/date planner.
USER: Create a 3-stop evening itinerary for ${city}. Budget: ${budget}. Mood: ${mood}. Duration: 3h. Provide times, names of places (generic if you don't have live data), 1-sentence reason per stop, and a 1-line summary for why this is a good date for this couple.
        `,
      });
      res.json({ result: response.text });
    } catch (e) {
      console.error(e);
      res.json({ result: "Error generating itinerary." });
    }
  });

  app.post('/api/gemini/proposal', async (req, res) => {
    const { name, memory, message } = req.body;
    if (!ai) return res.json({ result: `Dearest ${name},\n\nI still remember ${memory}. It was the moment I knew... \n\n${message}\n\nWill you join me on this journey?` });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `
SYSTEM: You are a romantic and sincere copywriter.
USER: Rewrite the following user inputs into a heartfelt 2-paragraph proposal message. Keep it personal, avoid cliches, and end with a simple question. 
Inputs: 
Name: ${name}
Memory: ${memory}
Message: ${message}
        `,
      });
      res.json({ result: response.text });
    } catch (e) {
      console.error(e);
      res.json({ result: "Error generating proposal." });
    }
  });

  app.post('/api/gemini/icebreaker', async (req, res) => {
    const { topic } = req.body;
    if (!ai) return res.json({ result: "What is the most difficult bug you've ever solved?" });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `
SYSTEM: You are a social facilitator for a 'Virtual Cafe' for developers.
USER: Give me a fun, lighthearted conversation starter or icebreaker question about ${topic || "coding"}. Keep it short.
        `,
      });
      res.json({ result: response.text });
    } catch (e) {
      console.error(e);
      res.json({ result: "What's your favorite programming language and why?" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

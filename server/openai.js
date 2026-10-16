import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* =========================
   ASK LUMI - TEXT
========================= */

app.post("/api/ask", async (req, res) => {
  try {
    const { question, attachments = [], history = [], displayName = "", responseStyle = "balanced" } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Please enter a question.",
      });
    }

    if (!Array.isArray(attachments) || attachments.length > 5) {
      return res.status(400).json({ error: "Please attach up to five files." });
    }

    if (!Array.isArray(history) || history.length > 12) {
      return res.status(400).json({ error: "Please keep the recent chat history to twelve messages or fewer." });
    }

    const styleInstructions = {
      balanced: "Use a natural balance of warmth and detail.",
      warm: "Use a little extra warmth and encouragement, while staying sincere and avoiding exaggerated praise.",
      concise: "Keep answers concise and practical, while remaining kind and emotionally attentive.",
    };
    const selectedStyle = styleInstructions[responseStyle] || styleInstructions.balanced;

    const supportedTypes = new Set([
      "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
      "application/pdf", "text/plain", "text/csv", "text/markdown",
      "audio/wav", "audio/x-wav", "audio/mp3", "audio/mpeg", "audio/aiff",
      "audio/aac", "audio/ogg", "audio/flac", "audio/webm",
      "audio/mp4", "audio/m4a",
    ]);
    const safeHistory = history
      .filter((message) => message && ["user", "assistant"].includes(message.role) && typeof message.text === "string")
      .map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.text.slice(0, 6000) }] }));
    const parts = [{ text: question.trim() }];

    for (const file of attachments) {
      if (!file || !supportedTypes.has(file.type) || typeof file.data !== "string") {
        return res.status(400).json({ error: `Lumi can't read that file type yet: ${file?.name || "unknown file"}. Try an image, PDF, text file, or audio recording.` });
      }
      const bytes = Buffer.from(file.data, "base64");
      if (!bytes.length || bytes.length > 12 * 1024 * 1024) {
        return res.status(400).json({ error: "Each attachment must be under 12 MB." });
      }
      parts.push({ inlineData: { mimeType: file.type, data: bytes.toString("base64") } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [...safeHistory, { role: "user", parts }],
      config: {
        systemInstruction: `You are Lumi, a thoughtful, emotionally aware learning and life companion. The current user's name is ${String(displayName).slice(0, 80) || "not provided"}.

Keep continuity: use the prior messages to understand references and remember what the person has already told you in this conversation. Do not introduce yourself, say "Hi, I'm Lumi", or repeat a greeting in every answer. Reply directly and naturally; greet only when it fits a genuinely new conversation.

Adapt to the situation. For school, explain clearly in manageable steps and encourage learning. For a breakup or another painful experience, listen first, acknowledge the feeling without minimizing it, then ask whether they want comfort, perspective, or practical next steps when that would help. For hunger or urgent practical needs, respond warmly and focus on immediate realistic options and nearby trusted support; do not lecture or shame. For other topics, match the user's tone while staying kind, grounded, and useful.

Do not pretend to be a therapist or make diagnoses. If someone describes imminent danger or intent to harm themselves or someone else, be calm and supportive, encourage immediate contact with a trusted person and local emergency/crisis support. Be honest about uncertainty. When files or media are attached, inspect them and answer the request about them. Keep explanations appropriate for a student without assuming every conversation is about school.`
          + `\n\nThe user's reply-style preference is: ${selectedStyle}`
      },
    });

    res.json({
      answer: response.text,
    });
  } catch (error) {
    console.error("Gemini text error:", error);

    res.status(500).json({
      error: "LumiAI could not generate a response. Please try again.",
    });
  }
});

/* =========================
   GENERATE LUMI IMAGE
   POLLINATIONS
========================= */

app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter an image prompt.",
      });
    }

    console.log("Generating Lumi image with Pollinations...");

    const imageUrl =
      `https://gen.pollinations.ai/image/${encodeURIComponent(
        prompt.trim()
      )}?model=flux`;

    const response = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Pollinations image error:",
        response.status,
        errorText
      );

      return res.status(response.status).json({
        error: "Pollinations could not generate the image.",
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    res.json({
      image: `data:image/jpeg;base64,${base64Image}`,
    });
  } catch (error) {
    console.error("Pollinations image error:", error);

    res.status(500).json({
      error: "Lumi could not generate the image. Please try again.",
    });
  }
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(
    `LumiAI API server running on http://localhost:${PORT}`
  );
});

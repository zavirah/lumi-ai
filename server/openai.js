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
    const { question, attachments = [] } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Please enter a question.",
      });
    }

    if (!Array.isArray(attachments) || attachments.length > 5) {
      return res.status(400).json({ error: "Please attach up to five files." });
    }

    const supportedTypes = new Set([
      "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
      "application/pdf", "text/plain", "text/csv", "text/markdown",
      "audio/wav", "audio/x-wav", "audio/mp3", "audio/mpeg", "audio/aiff",
      "audio/aac", "audio/ogg", "audio/flac", "audio/webm",
      "audio/mp4", "audio/m4a",
    ]);
    const parts = [{ text: `You are LumiAI, a friendly educational AI assistant.

Answer the student's question clearly and simply. Use examples when helpful. If they attach an image, document, or audio, inspect it and respond to their request. Keep the explanation appropriate for a student.

Student's question:
${question.trim()}` }];

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
      contents: [{ role: "user", parts }],
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
